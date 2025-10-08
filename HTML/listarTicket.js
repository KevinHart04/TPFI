/**********************************************************************************************
 * listarTicket.js — versión segura
 * ---------------------------------------------------------------------------------------------
 * UADER - FCyT - Ingeniería de Software I
 * Caso de estudio: Mesa de Ayuda
 *
 * Adaptación 2025:
 * - Reemplaza lectura desde URL por uso de sessionStorage.
 * - Evita exposición de información sensible en la barra de direcciones.
 * - Código ordenado y documentado paso a paso.
 **********************************************************************************************/

/*---------------------------------------------------------------------------------------------
    1️⃣  Recuperar datos del usuario autenticado desde sessionStorage
    -------------------------------------------------------------------------------------------
    En el loginClient.js, cuando el usuario se autentica correctamente, guardamos:
        sessionStorage.setItem("contacto", contacto);
        sessionStorage.setItem("nombre", nombre);
        sessionStorage.setItem("fecha_ultimo_ingreso", fecha);
    Esto permite acceder a los datos sin pasarlos por la URL.
---------------------------------------------------------------------------------------------*/

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

// Extraer datos individuales
const contacto = usuario.contacto;
const nombre = usuario.nombre;
const fecha_ultimo_ingreso = usuario.fecha_ultimo_ingreso;

// Validar si hay sesión activa
if (!contacto || !nombre) {
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
    // Se prepara la solicitud al backend con el contacto almacenado
    const body = { contacto: contacto };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    console.log("📡 Solicitando tickets de:", contacto);

    // Se hace la llamada a la API REST
    const res = await fetch(RESTAPI.listarTicket, options);
    const data = await res.json();

    // Validamos respuesta
    if (data.response !== "OK") {
      HTMLResponse.innerHTML = `<p style="color:red;">${data.message || "Error al obtener tickets"}</p>`;
      return;
    }

    // Si hay tickets, se construye la lista en el DOM
    data.data.forEach((ticket) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>ID:</strong> ${ticket.id}<br>
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
    -------------------------------------------------------------------------------------------
    Permite al usuario salir y limpiar la sesión sin exponer datos.
---------------------------------------------------------------------------------------------*/
const logoutBtn = document.querySelector("#logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "loginClient.html";
  });
}
