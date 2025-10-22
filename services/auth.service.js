// [+] Lógica de autenticación y registro de clientes

import bcrypt from "bcrypt";
import {v4 as uuidv4} from "uuid";
import { getClienteByContacto, addCliente, resetClientePassword } from "./dynamo.service.js";
import { escapeHtml } from "../utils/sanitizer.js"; // Import the sanitizer
import log from "../utils/logger.js";

/**
 * Validar login de cliente
 * @param {string} contacto - email del cliente
 * @param {string} password - contraseña en texto plano
 * @returns {Promise<Object|null>} Retorna el cliente si ok, o null si falla
 */

export const validarLogin = async (contacto, password) => {
    const cliente = await getClienteByContacto(contacto);
    // Chequeamos si el cliente existe, o su contraseña está vacía
    if (!cliente || !cliente.password) return null;

    // Si conincide la contraseña en texto plano, se alerta.
    if (cliente.password === password) {
        log.warn(`Login exitoso con contraseña en texto plano para ${contacto}. Se recomienda actualizar a hash.`);
        return cliente;
    }

    // Si la contraseña está hasheada, comparamos con bcrypt
    const ok = await bcrypt.compare(password, cliente.password);
    return ok ? cliente : null;
};

/**
 * Registrar un nuevo cliente
 * @param {Object} cliente - { Nombre, contacto, password, fecha_registro }
 * @returns {Promise<Object>} Cliente creado
 */
export const registrarClienteService = async (cliente) => {
  // Se sanitizan los inputs para prevenir XSS
  cliente.nombre = escapeHtml(cliente.nombre);
  cliente.contacto = escapeHtml(cliente.contacto);
  
  // Generar un UUID para el nuevo cliente
    cliente.id = uuidv4();

    // Establecer valores por defecto
    cliente.fecha_alta = new Date().toISOString();
    cliente.activo = true;
    cliente.registrado = true;
    cliente.fecha_ultimo_ingreso = null; // Se actualizará al hacer login

    // Hashear contraseña
    cliente.password = await bcrypt.hash(cliente.password, 10);
    return await addCliente(cliente);
};

export const resetPasswordService = async (contacto, password) => {
  // Buscamos el cliente por contacto
  const cliente = await getClienteByContacto(contacto);
  if (!cliente) {
    log.warn(`Intento de reset fallido: ${contacto} no existe.`);
    throw new Error("Cliente no encontrado para resetear contraseña.");
  }

  const passwordHash = await bcrypt.hash(password, 10);


  return await resetClientePassword(cliente.id, passwordHash);
};
