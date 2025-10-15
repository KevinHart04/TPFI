/**
 * clientes.controller.js
 * Controladores de login y registro
 */

import { validarLogin, registrarClienteService, resetPasswordService } from "../services/auth.service.js";

/**
 * POST /clientes/login
 * Login de cliente
 */
export const loginCliente = async (req, res) => {
    try {
        const { contacto, password } = req.body;

        console.log(`🔑 Intento de login: contacto(${contacto})`); // ✅ seguro, no mostramos password

        if (!contacto || !password) {
            return res.status(400).json({ response: "ERROR", message: "Faltan datos de login" });
        }

        const cliente = await validarLogin(contacto, password);

        if (!cliente) {
            return res.status(401).json({ response: "ERROR", message: "Credenciales inválidas" });
        }

        console.log(`✅ Login exitoso para: ${cliente.contacto}`); // Log de sesión válida

        res.json({
            response: "OK",
            id: cliente.id,
            contacto: cliente.contacto,
            nombre: cliente.nombre || "Usuario", // ✅ Usamos un valor por defecto si 'nombre' es undefined
            fecha_ultimo_ingreso: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error en loginCliente:", error);
        res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
    }
};

/**
 * POST /clientes/registro
 * Registrar nuevo cliente
 */
export const registrarCliente = async (req, res) => {
    try {
        const cliente = req.body;

        if (!cliente.contacto || !cliente.password) {
            return res.status(400).json({ response: "ERROR", message: "Faltan datos" });
        }

        const creado = await registrarClienteService(cliente);

        res.json({ response: "OK", data: creado });
    } catch (error) {
        console.error("Error en registrarCliente:", error);
        res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
    }
};

export const resetPassword = async (req, res) => {
  const { contacto, password } = req.body;
  if (!contacto || !password) return res.status(400).json({ response: "ERROR", message: "Faltan datos" });

  try {
    await resetPasswordService(contacto, password); // función en auth.service.js que hace hash y actualiza DB
    res.json({ response: "OK" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
  }
};
