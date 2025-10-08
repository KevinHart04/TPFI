/**********************************************************************************************
 * listarTicket.js — versión con búsqueda por ID de cliente
 * ---------------------------------------------------------------------------------------------
 * UADER - FCyT - Ingeniería de Software I
 * Caso de estudio: Mesa de Ayuda
 *
 * Adaptación 2025:
 * - Ahora busca tickets usando el ID del cliente (más seguro y confiable).
 * - Mantiene uso de sessionStorage para no exponer datos en la URL.
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
  window.location.href = "loginClient.html";
}

/*---------------------------------------------------------------------------------------------
    2️⃣  Referencias a elementos del DOM donde se mostrarán los tickets
---------------------------------------------------------------------------------------------*/

const HTMLResponse = document.querySelector("#app");
const tituloUsuario = document.querySelector("#usuario");
const ul = document.createElement("ul");

/*---------------------------------------------------------------------------------------------
    3️⃣  Mostrar información del usuario autenticado en pantalla
---------------------------------------------------------------------------------------------*/
tituloUsuario.innerHTML = `
  <strong>Usuario:</strong> ${nombre} (${contacto})<br>
  <strong>ID Cliente:</strong> ${id_cliente}<br> <!-- 🔹 NUEVO: mostramos el ID -->
  <strong>Último ingreso:</strong> ${fecha_ultimo_ingreso}
`;

/*---------------------------------------------------------------------------------------------
    4️⃣  Definir la URL del endpoint de tickets en el servidor local
---------------------------------------------------------------------------------------------*/
const RESTAPI = {
  listarTicket: "http://localhost:8080/api/listarTicket",
};

/*---------------------------------------------------------------------------------------------
    5️⃣  Función para obtener y mostrar los tickets del usuario logueado
---------------------------------------------------------------------------------------------*/

async function obtenerTickets() {
  try {
    /* 🔹 MODIFICADO: ahora enviamos el id_cliente al backend */
    const body = { id_cliente: id_cliente };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    console.log("📡 Solicitando tickets del cliente con ID:", id_cliente);

    const res = await fetch(RESTAPI.listarTicket, options);
    const data = await res.json();

    if (data.response !== "OK") {
      HTMLResponse.innerHTML = `<p style="color:red;">${data.message || "Error al obtener tickets"}</p>`;
      return;
    }

    // Mostrar tickets en el DOM
    data.data.forEach((ticket) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>ID Ticket:</strong> ${ticket.id}<br>
        <strong>Descripción:</strong> ${ticket.descripcion}<br>
        <strong>Solución:</strong> ${ticket.solucion}<br>
        <strong>Fecha apertura:</strong> ${ticket.fecha_apertura}<br>
        <strong>Último contacto:</strong> ${ticket.ultimo_contacto}
      `;
      ul.appendChild(li);
    });

    HTMLResponse.appendChild(ul);

  } catch (error) {
    console.error("❌ Error al obtener tickets:", error);
    HTMLResponse.innerHTML = `<p style="color:red;">Error al conectar con el servidor.</p>`;
  }
}

/*---------------------------------------------------------------------------------------------
    6️⃣  Cargar los tickets automáticamente al abrir la página
---------------------------------------------------------------------------------------------*/
window.addEventListener("DOMContentLoaded", obtenerTickets);

/*---------------------------------------------------------------------------------------------
    7️⃣  (Opcional) Botón de cierre de sesión
---------------------------------------------------------------------------------------------*/
const logoutBtn = document.querySelector("#logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "loginClient.html";
  });
}
