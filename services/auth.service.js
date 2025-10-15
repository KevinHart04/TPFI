/**
 * auth.service.js
 * Servicios relacionados con autenticación de clientes
 */

import bcrypt from "bcrypt";
import {v4 as uuidv4} from "uuid";
import { getClienteByContacto, addCliente, resetClientePassword } from "./dynamo.service.js";
import log from "../utils/logger.js"; // Asegúrate que esta línea esté presente

/**
 * Validar login de cliente
 * @param {string} contacto - email del cliente
 * @param {string} password - contraseña en texto plano
 * @returns {Promise<Object|null>} Retorna el cliente si ok, o null si falla
 */
export const validarLogin = async (contacto, password) => {
    const cliente = await getClienteByContacto(contacto);
    // Si no se encontró el cliente o no tiene una contraseña guardada, fallamos.
    if (!cliente || !cliente.password) return null;

    // 1. Verificamos si la contraseña coincide en texto plano (para usuarios legacy)
    if (cliente.password === password) {
        log.warn(`Login exitoso con contraseña en texto plano para ${contacto}. Se recomienda actualizar a hash.`);
        return cliente; // Login exitoso para usuario antiguo
    }

    // 2. Si no, intentamos comparar con bcrypt (para usuarios con contraseña hasheada)
    const ok = await bcrypt.compare(password, cliente.password);
    return ok ? cliente : null;
};

/**
 * Registrar un nuevo cliente
 * @param {Object} cliente - { contacto, password, fecha_registro }
 * @returns {Promise<Object>} Cliente creado
 */
export const registrarClienteService = async (cliente) => {
    // Generar ID único
    cliente.id = uuidv4();

    // Hashear contraseña
    cliente.password = await bcrypt.hash(cliente.password, 10);
    return await addCliente(cliente); // tu función de DynamoService
};

export const resetPasswordService = async (contacto, password) => {
  const passwordHash = await bcrypt.hash(password, 10);

  // Primero, encontramos al cliente para obtener su ID
  const cliente = await getClienteByContacto(contacto);
  if (!cliente) {
    throw new Error("Cliente no encontrado para resetear contraseña.");
  }

  // Ahora, usamos la función correcta del servicio de DynamoDB con el ID
  return await resetClientePassword(cliente.id, passwordHash);
};
