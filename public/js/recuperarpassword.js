// Obtener referencias al formulario y elementos
const form = document.getElementById("formPassword");
const resultado = document.getElementById("resultado");

const RESTAPI = {
  resetPassword: "http://localhost:3000/clientes/resetPassword" // Esta ya estaba bien, ¡perfecto!
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const pass1 = document.getElementById("password1").value.trim();
  const pass2 = document.getElementById("password2").value.trim();

  // 1️⃣ Validaciones básicas
  if (!correo || !pass1 || !pass2) {
    resultado.innerHTML = "<span style='color:red;'>Todos los campos son obligatorios.</span>";
    return;
  }

  if (pass1 !== pass2) {
    resultado.innerHTML = "<span style='color:red;'>Las contraseñas no coinciden.</span>";
    return;
  }

  try {
    // 2️⃣ Llamada al backend modular
    const res = await fetch(RESTAPI.resetPassword, { // La URL se toma de la constante
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacto: correo, password: pass1 })
    });

    const data = await res.json();

    // 3️⃣ Validar respuesta del servidor
    if (data.response === "OK") {
      resultado.innerHTML = "<span style='color:green;'>Contraseña actualizada con éxito.</span>";
      setTimeout(() => {
        window.location.href = "./loginClient.html";
      }, 1500);
    } else {
      resultado.innerHTML = `<span style='color:red;'>${data.message || "Error al actualizar la contraseña."}</span>`;
    }

  } catch (error) {
    console.error("❌ Error al conectar con el servidor:", error);
    resultado.innerHTML = "<span style='color:red;'>No se pudo conectar con el servidor.</span>";
  }
});
