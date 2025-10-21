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
import 'dotenv/config'; // Carga las variables de entorno desde .env
import log from '../utils/logger.js';

// -------------------------------- Configuración de AWS DynamoDB --------------------------------
AWS.config.update({
  // Usa las variables de entorno, con valores por defecto si no están definidas
  region: process.env.AWS_REGION || "us-east-1",
  // El endpoint es opcional si usas AWS real, pero útil para DynamoDB local o emuladores
  endpoint: process.env.AWS_DYNAMODB_ENDPOINT || "http://dynamodb.us-east-1.amazonaws.com",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
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

/**
 * Escanea y devuelve todos los items de una tabla específica.
 * @param {string} tableName - El nombre de la tabla a escanear.
 * @returns {Promise<Array>} - Una promesa que resuelve a un array de items.
 */
export async function scanTable(tableName) {
  try {
    const params = {
      TableName: tableName,
    };
    const result = await docClient.scan(params).promise();
    log.info(`🔎 scanTable: encontrados ${result.Items.length} items en la tabla ${tableName}`);
    return result.Items;
  } catch (error) {
    log.error(`❌ Error en scanTable para la tabla ${tableName}:`, error);
    throw error;
  }
}
