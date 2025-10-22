// [+] Lógica para listar y crear tickets desde el cliente

//- Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

//-Recuperar datos del usuario desde sessionStorage

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

// Extraer datos individuales
const contacto = usuario.contacto;
const nombre = usuario.nombre;
const fecha_ultimo_ingreso = usuario.fecha_ultimo_ingreso;
const id_cliente = usuario.id;

// Validación básica, redirigir si no hay usuario
if (!contacto || !nombre || !id_cliente) {
  alert("Debe iniciar sesión primero.");
  window.location.href = "./loginClient.html";
}

//-Muestra la información del usuario en el DOM
function mostrarInfoUsuario() {
    const tituloUsuario = document.querySelector("#tituloUsuario"); 
    
    if (!tituloUsuario) {
        console.error("[x] Elemento #tituloUsuario no encontrado en el DOM");
        return;
    }
    
    tituloUsuario.innerHTML = `
      <strong>Usuario:</strong> ${escapeHtml(nombre)} (${escapeHtml(contacto)})<br>
      <strong>ID Cliente:</strong> ${escapeHtml(id_cliente)}<br> 
      <strong>Último ingreso:</strong> ${escapeHtml(fecha_ultimo_ingreso)}
    `;
}

// Definir las rutas de la API REST
const RESTAPI = {
  listarTicket: "http://localhost:3000/tickets/listarTicket",
  addTicket: "http://localhost:3000/tickets/addTicket",
};

//-Función para obtener y mostrar los tickets del cliente

async function obtenerTickets() {
    const tbody = document.querySelector("#tickets-body");

    if (!tbody) {
        console.error("[x] tbody no encontrado");
        return;
    }

    try {
        const body = { id_cliente: id_cliente };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        };

        const res = await fetch(RESTAPI.listarTicket, options);
        const data = await res.json();

        if (data.response !== "OK") {
            tbody.innerHTML = `<tr><td colspan="5" style="color:red;">${data.message || "Error al obtener tickets"}</td></tr>`;
            return;
        }

        tbody.innerHTML = ""; // Limpiar filas previas

        data.data.forEach(ticket => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${escapeHtml(nombre)}</td>
                <td>${escapeHtml(ticket.id)}</td>
                <td>${escapeHtml(ticket.descripcion)}</td>
                <td>${escapeHtml(ticket.solucion ? "Resuelto" : "Pendiente")}</td>
                <td>${escapeHtml(ticket.fecha_apertura)}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("❌ Error al obtener tickets:", error);
        tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al conectar con el servidor.</td></tr>`;
    }
}

//-Cargar la información del usuario y los tickets al cargar el DOM
window.addEventListener("DOMContentLoaded", function() {
    mostrarInfoUsuario(); 
    obtenerTickets();     
    setupNewTicketForm();
});

//-Lógica para el botón de logout
window.addEventListener("DOMContentLoaded", function() {
    const logoutBtn = document.querySelector("#logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.clear();
            window.location.href = "./loginClient.html"; // Corregido
        });
    }
});

//-Logica para el formulario de nuevo ticket
function setupNewTicketForm() {
    const btnShowForm = document.getElementById('btn-show-form');
    const btnCancel = document.getElementById('btn-cancel-new-ticket');
    const form = document.getElementById('form-new-ticket');
    const descriptionInput = document.getElementById('new-ticket-description');
    const messageDiv = document.getElementById('new-ticket-message');

    btnShowForm.addEventListener('click', () => {
        form.classList.remove('hidden');
        btnShowForm.classList.add('hidden');
    });

    btnCancel.addEventListener('click', () => {
        form.classList.add('hidden');
        btnShowForm.classList.remove('hidden');
        descriptionInput.value = '';
        messageDiv.textContent = '';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const descripcion = descriptionInput.value.trim();
        if (!descripcion) {
            messageDiv.textContent = 'La descripción no puede estar vacía.';
            messageDiv.style.color = 'red';
            return;
        }

        try {
            const res = await fetch(RESTAPI.addTicket, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_cliente, descripcion })
            });
            const data = await res.json();

            if (data.response === 'OK') {
                messageDiv.textContent = 'Ticket creado con éxito.';
                messageDiv.style.color = 'green';
                setTimeout(() => btnCancel.click(), 1500);
                obtenerTickets();
            } else {
                messageDiv.textContent = data.message || 'Error al crear el ticket.';
            }
        } catch (error) {
            messageDiv.textContent = 'Error de conexión con el servidor.';
        }
    });
}
