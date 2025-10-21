// -----------------------------------------------------------------------------
// registroClient.js - Adaptado a backend modular
// -----------------------------------------------------------------------------

const form = document.getElementById('registroForm');
const resultado = document.getElementById('resultado');

const RESTAPI = {
  registroCliente: 'http://localhost:3000/clientes/registro'
};

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // 1. Obtener todos los valores del formulario
  const nombre = document.getElementById('nombre').value.trim();
  const contacto = document.getElementById('contacto').value.trim();
  const password = document.getElementById('password').value.trim();
  const password2 = document.getElementById('password2').value.trim();
  const termsAccepted = document.getElementById('termscondition').checked;

  // 2. Realizar todas las validaciones
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!nombre || !contacto || !password || !password2) {
    resultado.textContent = 'Debe completar todos los campos.';
    resultado.style.color = 'red';
    return;
  }
  if (password !== password2) {
    resultado.textContent = 'Las contraseñas no coinciden.';
    resultado.style.color = 'red';
    return;
  }
  if (!emailRegex.test(contacto)) {
    resultado.textContent = 'Ingrese un correo electrónico válido.';
    resultado.style.color = 'red';
    return;
  }
  if (password.length < 4) { // Ajustado a 4 para pruebas, puedes poner 6 o más para producción
    resultado.textContent = 'La contraseña debe tener al menos 4 caracteres.';
    resultado.style.color = 'red';
    return;
  }
  if (!termsAccepted) {
    resultado.textContent = 'Debe aceptar los términos y condiciones.';
    resultado.style.color = 'red';
    return;
  }

  // 3. Construir el cuerpo de la solicitud y enviarla
  fetch(RESTAPI.registroCliente, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: nombre,
      contacto: contacto,
      password: password
    })
  })
    .then(res => res.json())
    .then(response => {
      // 4. Procesar la respuesta del servidor
      if (response.response === 'OK') {
        resultado.textContent = 'Registro exitoso. Redirigiendo al login...';
        resultado.style.color = 'green';
        setTimeout(() => {
          window.location.href = 'loginClient.html';
        }, 2000);
      } else {
        resultado.textContent = response.message || 'Error al registrar usuario.';
        resultado.style.color = 'red';
      }
    })
    .catch(err => {
      console.error('❌ Error al conectar con el servidor:', err);
      resultado.textContent = 'No se pudo conectar con el servidor.';
      resultado.style.color = 'red';
    });
});
