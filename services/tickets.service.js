// [+] Servicios para la gestión de tickets en DynamoDB

import { ScanCommand, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamo.service.js"; 
import { escapeHtml } from "../utils/sanitizer.js";
import log from "../utils/logger.js";

/**
 * Obtener tickets de un cliente específico
 * @param {string} id_cliente
 * @returns {Promise<Array>} Lista de tickets
 */
export const getTicketsByClienteId = async (id_cliente) => {
  try {
    const params = {
      TableName: "ticket",
      FilterExpression: "clienteID = :c",
      ExpressionAttributeValues: { ":c": id_cliente }
    };
    const result = await docClient.send(new ScanCommand(params));
    log.info(`getTicketsByClienteId: encontrados ${result.Items.length} ticket(s) para ID ${id_cliente}`);
    return result.Items;
  } catch (error) {
    log.error("Error en getTicketsByClienteId:", error);
    throw error;
  }
};

/**
 * Agregar un nuevo ticket
 * @param {Object} ticket
 * @returns {Promise<Object>} Ticket creado
 */
export const addTicketDB = async (ticket) => {
  try {
    // Se sanitizan los inputs para prevenir XSS antes de almacenar
    ticket.descripcion = escapeHtml(ticket.descripcion);

    const params = {
      TableName: "ticket",
      Item: ticket, // El ticket ya viene con id_ticket desde el controller
      ConditionExpression: "attribute_not_exists(id)"
    };
    await docClient.send(new PutCommand(params));
    log.success(`addTicketDB: Ticket creado correctamente para cliente ${ticket.clienteID}`);
    return ticket;
  } catch (error) {
    log.error("Error en addTicketDB:", error);
    throw error;
  }
};

/**
 * Obtener un ticket por ID
 * @param {string} id_ticket
 * @returns {Promise<Object|null>} Ticket encontrado o null
 */
export const getTicketByIdDB = async (id) => {
  try {
    const params = {
      TableName: "ticket",
      Key: { id }
    };
    const result = await docClient.send(new GetCommand(params));
    log.info(`getTicketByIdDB: resultado para ID ${id}:`, result.Item);
    return result.Item || null;
  } catch (error) {
    log.error("Error en getTicketByIdDB:", error);
    throw error;
  }
};

/**
 * Actualizar un ticket existente
 * @param {Object} ticket
 * @returns {Promise<Object>} Ticket actualizado
 */
export const updateTicketDB = async (ticket) => {
  try {
    // Se sanitizan los inputs para prevenir XSS antes de actualizar
    ticket.descripcion = escapeHtml(ticket.descripcion);
    ticket.estado = escapeHtml(ticket.estado);

    const params = {
      TableName: "ticket",
      Key: { id: ticket.id },
      UpdateExpression: "SET #d = :d, #s = :s",
      ExpressionAttributeNames: {
        "#d": "descripcion",
        "#s": "estado"
      },
      ExpressionAttributeValues: {
        ":d": ticket.descripcion,
        ":s": ticket.estado
      },
      ReturnValues: "ALL_NEW"
    };
    const result = await docClient.send(new UpdateCommand(params));
    log.success(`updateTicketDB: Ticket actualizado ID ${ticket.id}`);
    return result.Attributes;
  } catch (error) {
    log.error("Error en updateTicketDB:", error);
    throw error;
  }
};
