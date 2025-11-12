// [+] Capa de servicio para interactuar con AWS DynamoDB

import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import 'dotenv/config'; // Carga las variables de entorno desde .env
import log from '../utils/logger.js';

const initializeDynamoDB = async () => {
  try {
    //- Configuración del cliente de DynamoDB
    const client = new DynamoDBClient({
      // Usa las variables de entorno, con valores por defecto si no están definidas
      region: process.env.AWS_REGION || "us-east-1",
      endpoint: process.env.AWS_DYNAMODB_ENDPOINT || "http://dynamodb.us-east-1.amazonaws.com",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    // "Ping" a la tabla 'cliente' para verificar la conexión y credenciales
    const command = new DescribeTableCommand({ TableName: "cliente" });
    await client.send(command);
    log.success("DynamoService: Conexión con AWS DynamoDB y tabla 'cliente' verificada correctamente.");

    const marshallOptions = { removeUndefinedValues: true };
    const translateConfig = { marshallOptions };

    // Traduce el cliente de bajo nivel a uno de más alto nivel
    return DynamoDBDocumentClient.from(client, translateConfig);

  } catch (error) {
    log.error("DynamoService: Falló la conexión con DynamoDB. Verifica las credenciales, la configuración de red y que la tabla 'cliente' exista.", error.message);
    // Si la conexión falla, la aplicación no puede continuar.
    process.exit(1);
  }
};

// Se inicializa el cliente de forma asíncrona y se exporta la instancia.
export const docClient = await initializeDynamoDB();

// -------------------------------- Funciones de Cliente ----------------------------------------

export async function getClienteByContacto(contacto) {
  // Mediante un Scan buscamos el cliente por su contacto (email)
  try {
    const params = {
      TableName: "cliente",
      FilterExpression: "contacto = :c",
      ExpressionAttributeValues: { ":c": contacto }
    };

    // ?Usa scannCommand para buscar, ya que contacto no es key primaria.

    // *La base de datos (DynamoDB) devuelve un objeto con una lista `Items`. Esta lista contendrá TODOS los clientes que coincidan con el email.

    const result = await docClient.send(new ScanCommand(params));
    log.info(`getClienteByContacto: encontrados ${result.Items.length} cliente(s) para ${contacto}`);
    
    return result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    log.error("Error en getClienteByContacto:", error);
    throw error;
  }
}
// *- Si `result.Items` tiene uno o más clientes, la expresión `result.Items.length > 0` es verdadera.
//   !En este caso, devolvemos solo el primer cliente de la lista (`result.Items[0]`).

// *- Si `result.Items` es una lista vacía (ningún cliente encontrado), la expresión es falsa.
//   !En este caso, devolvemos `null`.

export async function getClienteById(id) {
  try {
    const params = {
      TableName: "cliente",
      Key: { id }
    };
    const result = await docClient.send(new GetCommand(params));
    log.info(`getClienteById: resultado para ID ${id}:`, result.Item);
    return result.Item || null;
  } catch (error) {
    log.error("Error en getClienteById:", error);
    throw error;
  }
}

export async function addCliente(cliente) {
  try {
    const params = {
      TableName: "cliente",
      Item: cliente,
      ConditionExpression: 'attribute_not_exists(contacto)' // Evita duplicados por contacto
    };
    await docClient.send(new PutCommand(params));
    log.success(`addCliente: Cliente creado correctamente: ${cliente.contacto}`);
    return cliente;
  } catch (error) {
    log.error("Error en addCliente:", error);
    throw error;
  }
}

export async function updateCliente(cliente) {
  try {
    const params = {
      TableName: "cliente",
      Key: { contacto: cliente.contacto },
      UpdateExpression: "SET #n = :n, #p = :p, #a = :a, #r = :r", // Parametros a actualizar
      ExpressionAttributeNames: {
        "#n": "nombre",
        "#p": "password",                                         // Nombres de atributo reservados
        "#a": "activo",
        "#r": "registrado"
      },
      ExpressionAttributeValues: {
        ":n": cliente.nombre,
        ":p": cliente.password,                                   // Valores nuevos
        ":a": cliente.activo === true,
        ":r": cliente.registrado === true
      },
      ReturnValues: "ALL_NEW"                                     // Retorna el item actualizado, no solo un status
    };
    const data = await docClient.send(new UpdateCommand(params));
    log.success(`updateCliente: Cliente actualizado: ${cliente.contacto}`);
    return data.Attributes;
  } catch (error) {
    log.error("Error en updateCliente:", error);
    throw error;
  }
}

export async function resetClientePassword(id, newPassword) {
  // Recibe id del cliente y nueva contraseña hasheada
  try {
    const params = {
      TableName: "cliente",
      Key: { id },
      UpdateExpression: "SET #p = :p",
      ExpressionAttributeNames: { "#p": "password" },
      ExpressionAttributeValues: { ":p": newPassword },
      ReturnValues: "ALL_NEW"
    };
    const data = await docClient.send(new UpdateCommand(params));
    log.success(`resetClientePassword: Contraseña actualizada para ID ${id}`);
    return data.Attributes;
  } catch (error) {
    log.error("Error en resetClientePassword:", error);
    throw error;
  }
}

/**
 * Actualiza la fecha del último ingreso de un cliente.
 * @param {string} id - El ID del cliente.
 * @param {string} fecha - La fecha en formato ISO.
 * @returns {Promise<Object>} - Los atributos actualizados del cliente.
 */
export async function updateClienteLastLogin(id, fecha) {
  try {
    const params = {
      TableName: "cliente",
      Key: { id },
      UpdateExpression: "SET fecha_ultimo_ingreso = :f",
      ExpressionAttributeValues: { ":f": fecha },
      ReturnValues: "ALL_NEW"
    };
    const data = await docClient.send(new UpdateCommand(params));
    log.info(`updateClienteLastLogin: Fecha de ingreso actualizada para ID ${id}`);
    return data.Attributes;
  } catch (error) {
    log.error(`Error en updateClienteLastLogin para ID ${id}:`, error);
    throw error;
  }
}

//! SOLO PARA TESTEO: Escanea y devuelve todos los clientes
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
    const result = await docClient.send(new ScanCommand(params));
    log.info(`scanTable: encontrados ${result.Items.length} items en la tabla ${tableName}`);
    return result.Items;
  } catch (error) {
    log.error(`Error en scanTable para la tabla ${tableName}:`, error);
    throw error;
  }
}
