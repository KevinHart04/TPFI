/**********************************************************************************************
 * listarTicket.js — versión con búsqueda por ID de cliente
 * ---------------------------------------------------------------------------------------------
 * UADER - FCyT - Ingeniería de Software I
 * Caso de estudio: Mesa de Ayuda
 *
 * Adaptación 2025:
 * - Ahora busca tickets usando el ID del cliente (más seguro y confiable).
 * - Mantiene uso de sessionStorage para no exponer datos en la URL.
 * - ✅ CORRECCIÓN: Selector corregido de "#usuario" a "#tituloUsuario" para coincidir con el HTML.
 * - ✅ CORRECCIÓN: Toda la manipulación del DOM (incluyendo info de usuario) ahora está dentro de DOMContentLoaded para evitar errores de "null".
 **********************************************************************************************/

/*---------------------------------------------------------------------------------------------
    1️⃣  Recuperar datos del usuario autenticado desde sessionStorage
---------------------------------------------------------------------------------------------*/

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

// Extraer datos individuales
const contacto = usuario.contacto;
const nombre = usuario.nombre;
const fecha_ultimo_ingreso = usuario.fecha_ultimo_ingreso;

/* 🔹 NUEVO: agregamos el ID del usuario */
const id_cliente = usuario.id; // ✅ ID del cliente (debe haberse guardado al hacer login)

// Validar si hay sesión activa
if (!contacto || !nombre || !id_cliente) {
  alert("Debe iniciar sesión primero.");
  window.location.href = "./loginClient.html"; // Corregido
}

/*---------------------------------------------------------------------------------------------
    2️⃣  Referencias a elementos del DOM donde se mostrarán los tickets
    (Se inicializan dentro de DOMContentLoaded para seguridad)
---------------------------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------
    3️⃣  Función para mostrar información del usuario autenticado en pantalla
---------------------------------------------------------------------------------------------*/
function mostrarInfoUsuario() {
    const tituloUsuario = document.querySelector("#tituloUsuario"); // ✅ CORREGIDO: Selector correcto "#tituloUsuario"
    
    if (!tituloUsuario) {
        console.error("❌ Elemento #tituloUsuario no encontrado en el DOM");
        return;
    }
    
    tituloUsuario.innerHTML = `
      <strong>Usuario:</strong> ${nombre} (${contacto})<br>
      <strong>ID Cliente:</strong> ${id_cliente}<br> <!-- 🔹 NUEVO: mostramos el ID -->
      <strong>Último ingreso:</strong> ${fecha_ultimo_ingreso}
    `;
}

/*---------------------------------------------------------------------------------------------
    4️⃣  Definir la URL del endpoint de tickets en el servidor local
---------------------------------------------------------------------------------------------*/
const RESTAPI = {
  listarTicket: "http://localhost:3000/tickets/listarTicket",
  addTicket: "http://localhost:3000/tickets/addTicket",
};

/*---------------------------------------------------------------------------------------------
    5️⃣  Función para obtener y mostrar los tickets del usuario logueado
---------------------------------------------------------------------------------------------*/

async function obtenerTickets() {
    const tbody = document.querySelector("#tickets-body");

    if (!tbody) {
        console.error("❌ tbody no encontrado");
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
                <td>${nombre}</td>
                <td>${ticket.id}</td>
                <td>${ticket.descripcion}</td>
                <td>${ticket.solucion ? "Resuelto" : "Pendiente"}</td>
                <td>${ticket.fecha_apertura}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("❌ Error al obtener tickets:", error);
        tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al conectar con el servidor.</td></tr>`;
    }
}

/*---------------------------------------------------------------------------------------------
    6️⃣  Cargar la página automáticamente al abrir: info de usuario + tickets
---------------------------------------------------------------------------------------------*/
window.addEventListener("DOMContentLoaded", function() {
    mostrarInfoUsuario(); // ✅ Ahora dentro de DOMContentLoaded
    obtenerTickets();     // ✅ Ya estaba, pero ahora todo el flujo es seguro
    setupNewTicketForm(); // ✅ NUEVO: Configurar el formulario de nuevo ticket
});

/*---------------------------------------------------------------------------------------------
    7️⃣  (Opcional) Botón de cierre de sesión
---------------------------------------------------------------------------------------------*/
window.addEventListener("DOMContentLoaded", function() {
    const logoutBtn = document.querySelector("#logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.clear();
            window.location.href = "./loginClient.html"; // Corregido
        });
    }
});

/*---------------------------------------------------------------------------------------------
    8️⃣  NUEVO: Lógica para el formulario de creación de tickets
---------------------------------------------------------------------------------------------*/
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
                setTimeout(() => btnCancel.click(), 1500); // Oculta el form y limpia
                obtenerTickets(); // Recarga la lista de tickets
            } else {
                messageDiv.textContent = data.message || 'Error al crear el ticket.';
            }
        } catch (error) {
            messageDiv.textContent = 'Error de conexión con el servidor.';
        }
    });
}
