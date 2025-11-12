// [+] Logica de login del cliente

const formE1 = document.querySelector('.form');

// -----------------------------------------------------------------------------
// 1. Interceptar envío del formulario
// -----------------------------------------------------------------------------
formE1.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(formE1);
  const data = Object.fromEntries(formData);

  console.log('🔎 Datos del formulario:', data.contacto);

  // ---------------------------------------------------------------------------
  // 2. Validaciones básicas antes de enviar
  // ---------------------------------------------------------------------------
  if (!data.contacto || !data.password) {
    mostrarMensaje('Debe indicar correo y contraseña.', 'RED');
    return;
  }

  if (data.contacto === 'pec') {
    mostrarMensaje('El usuario <pec> no es bienvenido en este sistema.', 'RED');
    return;
  }

  if (data.termscondition !== 'on') {
    mostrarMensaje('Debe aceptar los Términos y Condiciones para continuar.', 'RED');
    return;
  }

//-Definir el modo de operación y la API correspondiente
  const MODE = 'LOCAL'; //todo: Cambiar a 'AWS' o 'TYPICODE' según el entorno

  const RESTAPI = {
    loginCliente: 'http://localhost:3000/clientes/login',
    listarTicket: 'http://localhost:3000/tickets/listarTicket'
  };

  const AWS_API = 'https://fmtj0jrpp9.execute-api.us-east-1.amazonaws.com/default/loginUserGET';
  const TYPICODE_API = 'https://my-json-server.typicode.com/lu7did/MesaAyuda/posts/';

  let API = '';
  let APIoptions = {};

//-configurar la solicitud según el modo
  if (MODE === 'LOCAL') {
    // *Se usa POST para enviar datos sensibles (usuario/contraseña) de forma segura en el cuerpo de la petición.
    // !No se usa GET porque expondría la contraseña en la URL, lo cual es inseguro.
    API = RESTAPI.loginCliente;
    APIoptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contacto: data.contacto,
        password: data.password
      })
    };
  }

  if (MODE === 'TYPICODE') {
    // *Se usa GET porque se está consultando una API de prueba que espera el ID en la URL para devolver un recurso.
    // !No se usa POST porque esta API de prueba no está diseñada para recibir datos, solo para entregar información.
    console.log('🌐 Modo TYPICODE: usando API JSON falsa');
    API = TYPICODE_API + data.contacto; // O un ID si el profe lo requiere
    APIoptions = { method: 'GET' };
  }

  if (MODE === 'AWS') {
    // *Se usa GET porque el endpoint de AWS Lambda fue programado para recibir los datos directamente en la URL.
    // !No se usa POST porque la función Lambda no está configurada para leer datos del cuerpo de una petición POST.
    console.log('🌐 Modo AWS: usando Lambda');
    API = `${AWS_API}?ID=${data.contacto}&PASSWORD=${data.password}`;
    APIoptions = { method: 'GET' };
  }

//Envia la solicitud al controlador correspondiente
  fetch(API, APIoptions)
    .then((res) => res.json())
    .then((response) => {
      console.log('Respuesta del servidor:', response);

      if (response.response === 'OK') {
        console.log(`Login exitoso: ${response.nombre}`);

        // ---------------------------------------------------------------------
        // 6. Guardar los datos del usuario en sessionStorage
        // ---------------------------------------------------------------------
        const userSession = {
          id: response.id, // 🔹 nuevo campo
          contacto: response.contacto,
          nombre: response.nombre,
          fecha_ultimo_ingreso: response.fecha_ultimo_ingreso,
          mode: MODE
          };

  sessionStorage.setItem('usuario', JSON.stringify(userSession));

        // Redirigir a la pantalla de tickets
        window.location.href = './listarTicket.html';
      } else {
        mostrarMensaje('Usuario o contraseña incorrectos. Intente nuevamente', 'RED');
      }
    })
    .catch((err) => {
      console.error('Error en la solicitud:', err);
      mostrarMensaje('No se pudo conectar con el servidor.', 'RED');
    });
});

// -----------------------------------------------------------------------------
// Función auxiliar para mostrar mensajes en pantalla
// -----------------------------------------------------------------------------
function mostrarMensaje(texto, color = 'BLACK') {
  const resultado = document.getElementById('resultado1');
  resultado.style.color = color;
  resultado.style.textAlign = 'center';
  resultado.textContent = texto;
}
