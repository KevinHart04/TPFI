/**
 * clientes.controller.js
 * Controladores de login y registro
 */

import { validarLogin, registrarClienteService, resetPasswordService } from "../services/auth.service.js";
import { scanTable, updateClienteLastLogin } from "../services/dynamo.service.js";
import log from "../utils/logger.js";
import chalk from "chalk";

/**
 * POST /clientes/login
 * Login de cliente
 */
export const loginCliente = async (req, res) => {
    try {
        const { contacto, password } = req.body;

        log.success(`Intento de login: contacto(${contacto})`);

        if (!contacto || !password) {
            return res.status(400).json({ response: "ERROR", message: "Faltan datos de login" });
        }

        const cliente = await validarLogin(contacto, password);

        if (!cliente) {
            return res.status(401).json({ response: "ERROR", message: "Credenciales inválidas" });
        }

        // Actualizar fecha de último ingreso
        const fechaIngreso = new Date().toISOString();
        await updateClienteLastLogin(cliente.id, fechaIngreso);

        log.success(`Login exitoso para:`, chalk.yellow(cliente.contacto)); // Log de sesión válida

        res.json({
            response: "OK",
            id: cliente.id,
            contacto: cliente.contacto,
            nombre: cliente.nombre || "Usuario", // ✅ Usamos un valor por defecto si 'nombre' es undefined
            fecha_ultimo_ingreso: fechaIngreso
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

        if (!cliente.nombre || !cliente.contacto || !cliente.password) {
            return res.status(400).json({ response: "ERROR", message: "Faltan datos: nombre, contacto y password son requeridos" });
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

/**
 * GET /clientes/listar
 * Listar todos los clientes
 */
export const listarClientes = async (req, res) => {
    try {
        log.info("Solicitud para listar todos los clientes");
        const clientes = await scanTable('cliente');
        res.json({ response: "OK", data: clientes });
    } catch (error) {
        log.error("Error en listarClientes:", error);
        res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
    }
};
