/**********************************************************************************************
 * DynamoService.js — Capa de acceso a AWS DynamoDB
 * --------------------------------------------------------------------------------------------
 * UADER - FCyT - Ingeniería de Software I
 * Adaptación 2025: Mesa de Ayuda
 *
 * Funciones para:
 *  - Obtener cliente por contacto o ID
 *  - Crear cliente
 *  - Actualizar cliente
 *  - Resetear contraseña
 *  - Obtener tickets por cliente
 *
 * Logs incluidos para verificar conexión y operaciones.
 **********************************************************************************************/

import AWS from 'aws-sdk';
import log from '../utils/logger.js';
import accessKeyId from '../../accessKeyId.js';
import secretAccessKey from '../../secretAccessKey.js';

// -------------------------------- Configuración de AWS DynamoDB --------------------------------
AWS.config.update({
  region: "us-east-1",
  endpoint: "http://dynamodb.us-east-1.amazonaws.com",
  accessKeyId,
  secretAccessKey
});

export const docClient = new AWS.DynamoDB.DocumentClient();
log.info("📦 DynamoService: DynamoDB configurado correctamente.");

// -------------------------------- Funciones de Cliente ----------------------------------------

export async function getClienteByContacto(contacto) {
  try {
    const params = {
      TableName: "cliente",
      FilterExpression: "contacto = :c",
      ExpressionAttributeValues: { ":c": contacto }
    };
    const result = await docClient.scan(params).promise();
    log.info(`🔎 getClienteByContacto: encontrados ${result.Items.length} cliente(s) para ${contacto}`);
    
    // ✅ AQUÍ: Imprimimos el contenido del usuario encontrado para debug
    console.log('📦 Contenido del usuario desde DynamoDB:', result.Items[0]);

    return result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    log.error("❌ Error en getClienteByContacto:", error);
    throw error;
  }
}

export async function getClienteById(id) {
  try {
    const params = {
      TableName: "cliente",
      Key: { id }
    };
    const result = await docClient.get(params).promise();
    log.info(`🔎 getClienteById: resultado para ID ${id}:`, result.Item);
    return result.Item || null;
  } catch (error) {
    log.error("❌ Error en getClienteById:", error);
    throw error;
  }
}

export async function addCliente(cliente) {
  try {
    const params = {
      TableName: "cliente",
      Item: cliente,
      ConditionExpression: 'attribute_not_exists(contacto)'
    };
    await docClient.put(params).promise();
    log.success(`✅ addCliente: Cliente creado correctamente: ${cliente.contacto}`);
    return cliente;
  } catch (error) {
    log.error("❌ Error en addCliente:", error);
    throw error;
  }
}

export async function updateCliente(cliente) {
  try {
    const params = {
      TableName: "cliente",
      Key: { contacto: cliente.contacto },
      UpdateExpression: "SET #n = :n, #p = :p, #a = :a, #r = :r",
      ExpressionAttributeNames: {
        "#n": "nombre",
        "#p": "password",
        "#a": "activo",
        "#r": "registrado"
      },
      ExpressionAttributeValues: {
        ":n": cliente.nombre,
        ":p": cliente.password,
        ":a": cliente.activo === true,
        ":r": cliente.registrado === true
      },
      ReturnValues: "ALL_NEW"
    };
    const data = await docClient.update(params).promise();
    log.success(`✅ updateCliente: Cliente actualizado: ${cliente.contacto}`);
    return data.Attributes;
  } catch (error) {
    log.error("❌ Error en updateCliente:", error);
    throw error;
  }
}

export async function resetClientePassword(id, newPassword) {
  try {
    const params = {
      TableName: "cliente",
      Key: { id },
      UpdateExpression: "SET #p = :p",
      ExpressionAttributeNames: { "#p": "password" },
      ExpressionAttributeValues: { ":p": newPassword },
      ReturnValues: "ALL_NEW"
    };
    const data = await docClient.update(params).promise();
    log.success(`✅ resetClientePassword: Contraseña actualizada para ID ${id}`);
    return data.Attributes;
  } catch (error) {
    log.error("❌ Error en resetClientePassword:", error);
    throw error;
  }
}

// -------------------------------- Funciones de Tickets ---------------------------------------

export async function getTicketsByClienteId(id_cliente) {
  try {
    const params = {
      TableName: "ticket",
      FilterExpression: "clienteID = :c",
      ExpressionAttributeValues: { ":c": id_cliente }
    };
    const result = await docClient.scan(params).promise();
    log.info(`🔎 getTicketsByClienteId: encontrados ${result.Items.length} ticket(s) para ID ${id_cliente}`);
    return result.Items;
  } catch (error) {
    log.error("❌ Error en getTicketsByClienteId:", error);
    throw error;
  }
}

export async function addTicket(ticket) {
  try {
    const params = {
      TableName: "ticket",
      Item: ticket,
      ConditionExpression: 'attribute_not_exists(id_ticket)'
    };
    await docClient.put(params).promise();
    log.success(`✅ addTicket: Ticket creado para cliente ${ticket.clienteID}`);
    return ticket;
  } catch (error) {
    log.error("❌ Error en addTicket:", error);
    throw error;
  }
}

export async function getTicketById(id_ticket) {
  try {
    const params = {
      TableName: "ticket",
      Key: { id_ticket }
    };
    const result = await docClient.get(params).promise();
    log.info(`🔎 getTicketById: Ticket encontrado:`, result.Item);
    return result.Item || null;
  } catch (error) {
    log.error("❌ Error en getTicketById:", error);
    throw error;
  }
}

export async function updateTicket(ticket) {
  try {
    const params = {
      TableName: "ticket",
      Key: { id_ticket: ticket.id_ticket },
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
    const data = await docClient.update(params).promise();
    log.success(`✅ updateTicket: Ticket actualizado ID ${ticket.id_ticket}`);
    return data.Attributes;
  } catch (error) {
    log.error("❌ Error en updateTicket:", error);
    throw error;
  }
}
