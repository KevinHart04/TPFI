    const form = document.getElementById('registroForm');
    const resultado = document.getElementById('resultado');

    form.addEventListener('submit', function(event) {
      event.preventDefault();
    
      const contacto = document.getElementById('contacto').value.trim();
      const password = document.getElementById('password').value.trim();
      const termsAccepted = document.getElementById('termscondition').checked;
    
      // Validación de formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!contacto || !password) {
        resultado.textContent = 'Debe completar todos los campos.';
        resultado.style.color = 'red';
        return;
      }
      if (!emailRegex.test(contacto)) {
        resultado.textContent = 'Ingrese un correo electrónico válido.';
        resultado.style.color = 'red';
        return;
      }
      if (password.length < 6) {
        resultado.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        resultado.style.color = 'red';
        return;
      }
      if (!termsAccepted) {
        resultado.textContent = 'Debe aceptar los términos y condiciones.';
        resultado.style.color = 'red';
        return;
      }
    
      // Simula verificación de existencia del usuario
      let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const existe = clientes.find(c => c.contacto === contacto);
    
      if (existe) {
        resultado.textContent = 'El usuario ya existe. No se puede registrar nuevamente.';
        resultado.style.color = 'red';
        return;
      }
    
      // Crear nuevo cliente
      const ahora = new Date().toLocaleString('es-AR');
      const nuevoCliente = {
        id: Date.now(),
        contacto: contacto,
        password: password,
        activo: true,
        registrado: true,
        fecha_registro: ahora,
        fecha_ultimo_ingreso: ahora,
        fecha_cambio_password: ahora,
        primer_ingreso: ahora
      };
    
      clientes.push(nuevoCliente);
      localStorage.setItem('clientes', JSON.stringify(clientes));
    
      resultado.textContent = 'Registro exitoso. Redirigiendo al login...';
      resultado.style.color = 'green';
    
      setTimeout(() => {
        window.location.href = 'loginClient.html';
      }, 2000);
    });