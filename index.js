/*************************************************************************************************
 * index.js — API REST “Mesa de Ayuda”
 * ------------------------------------------------------------------------------------------------
 * UADER - FCyT - Ingeniería de Software I
 * Caso de estudio: Mesa de Ayuda
 *
 * Adaptación 2025:
 * - Se reemplaza “id” por “contacto” (correo electrónico) como identificador de cliente.
 * - Se eliminan logs con contraseñas (riesgo crítico).
 * - Se estructura y documenta todo el código por secciones.
 * 
 * Autor original: Dr. Pedro E. Colla
 * Adaptación segura: Kevin + ChatGPT
 *************************************************************************************************/

//---------------------------------[ Dependencias principales ]-----------------------------------

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import AWS from 'aws-sdk';
import log from './utils/logger.js';
import accessKeyId from '../accessKeyId.js';
import secretAccessKey from '../secretAccessKey.js';

log.info("Iniciando servidor Mesa de Ayuda...");

//---------------------------------[ Configuración de AWS DynamoDB ]------------------------------

const awsConfig = {
  region: "us-east-1",
  endpoint: "http://dynamodb.us-east-1.amazonaws.com",
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
};

AWS.config.update(awsConfig);
const docClient = new AWS.DynamoDB.DocumentClient();

log.success("AWS DynamoDB configurado correctamente.");

//---------------------------------[ Configuración de Express ]-----------------------------------

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  log.success(`Servidor escuchando en http://localhost:${PORT}`);
});

//---------------------------------[ Función auxiliar ]-------------------------------------------

/**
 * Extrae una propiedad de un objeto dentro de un JSON anidado.
 * @param {string} keyValue - clave a buscar.
 * @param {Object} stringValue - objeto JSON.
 */
function jsonParser(keyValue, stringValue) {
  return JSON.parse(JSON.stringify(stringValue))[keyValue];
}

//---------------------------------[ API REST: Cliente ]------------------------------------------

/**
 * GET /api/cliente
 * Verifica que el API esté disponible.
 */
app.get('/api/cliente', (req, res) => {
  res.status(200).send({ response: "OK", message: "API Cliente disponible" });
  log.success("API Cliente disponible")
});

/**
 * POST /api/loginCliente
 * Autentica un cliente usando su correo (“contacto”) y contraseña.
 */
app.post('/api/loginCliente', async (req, res) => {
  const { contacto, password } = req.body;

  log.info(`Intento de login: contacto(${contacto})`);

  if (!contacto) return res.status(400).send({ response: "ERROR", message: "Contacto no informado" });
  if (!password) return res.status(400).send({ response: "ERROR", message: "Password no informada" });

  // Buscar el cliente por su contacto
  const result = await docClient.scan({
    TableName: "cliente",
    FilterExpression: 'contacto = :c',
    ExpressionAttributeValues: { ':c': contacto }
  }).promise();

  if (!result.Items.length)
    return res.status(400).send({ response: "ERROR", message: "Cliente no encontrado" });

  const cliente = result.Items[0];
  console.log("🔑 Contraseña DB:", cliente.password);
  console.log("🔑 Contraseña ingresada:", password);
  console.log("🔒 Cliente activo:", cliente.activo);
  console.log("👤 Datos del cliente:", cliente);


  if (cliente.password.trim() !== password.trim())
    return res.status(400).send({ response: "ERROR", message: "Contraseña incorrecta" });
  if (!cliente.activo)
    return res.status(400).send({ response: "ERROR", message: "Cliente inactivo" });

  log.success(`Login exitoso: ${contacto}`);

  // 🔹 devolvemos también el id del cliente
  res.status(200).send({
    response: "OK",
    id: cliente.id, // 🔹 lo incluimos acá
    contacto: cliente.contacto,
    nombre: cliente.nombre,
    fecha_ultimo_ingreso: cliente.fecha_ultimo_ingreso
  });
});


//---------------------------------[ Utilidad: Escaneo DB de clientes por contacto ]---------------

async function scanDb(contacto) {
  const params = {
    TableName: "cliente",
    FilterExpression: 'contacto = :contacto',
    ExpressionAttributeValues: { ':contacto': contacto }
  };

  const result = await docClient.scan(params).promise();
  return result.Items;
}

/**
 * POST /api/addCliente
 * Crea un nuevo cliente (correo único como identificador).
 */
app.post('/api/addCliente', async (req, res) => {
  const { contacto, password, nombre } = req.body;

  log.info(`Alta de nuevo cliente: ${contacto}`);

  if (!contacto || !password || !nombre) {
    return res.status(400).send({ response: "ERROR", message: "Datos incompletos" });
  }

  const exists = await scanDb(contacto);
  if (exists.length > 0) {
    return res.status(400).send({ response: "ERROR", message: "Cliente ya existe" });
  }

  const fecha = new Date().toLocaleDateString('es-AR');

  const newCliente = {
    contacto,
    nombre,
    password,
    activo: true,
    registrado: true,
    primer_ingreso: false,
    fecha_alta: fecha,
    fecha_cambio_password: fecha,
    fecha_ultimo_ingreso: fecha
  };

  const params = {
    TableName: "cliente",
    Item: newCliente,
    ConditionExpression: 'attribute_not_exists(contacto)',
  };

  docClient.put(params, (err) => {
    if (err) {
      res.status(400).send({ response: "ERROR", message: "Error al crear cliente: " + err });
    } else {
      res.status(200).send({ response: "OK", cliente: newCliente });
    }
  });
});

/**
 * POST /api/updateCliente
 * Actualiza nombre, password, activo o registrado de un cliente.
 */
app.post('/api/updateCliente', (req, res) => {
  const { contacto, nombre, password, activo, registrado } = req.body;

  log.info(`Actualizando cliente: ${contacto}`);

  if (!contacto || !nombre || !password)
    return res.status(400).send({ response: "ERROR", message: "Faltan datos obligatorios" });

  const params = {
    TableName: "cliente",
    Key: { contacto },
    UpdateExpression: "SET #n = :n, #p = :p, #a = :a, #r = :r",
    ExpressionAttributeNames: {
      "#n": "nombre",
      "#p": "password",
      "#a": "activo",
      "#r": "registrado"
    },
    ExpressionAttributeValues: {
      ":n": nombre,
      ":p": password,
      ":a": activo === true,
      ":r": registrado === true
    },
    ReturnValues: "ALL_NEW"
  };

  docClient.update(params, (err, data) => {
    if (err)
      return res.status(400).send({ response: "ERROR", message: "Error al actualizar: " + err });

    res.status(200).send({ response: "OK", cliente: data.Attributes });
  });
});

/**
 * POST /api/resetCliente
 * Cambia la contraseña de un cliente (identificado por contacto).
 */
app.post('/api/resetCliente', async (req, res) => {
  const { contacto, password } = req.body;

  // Validación de datos
  if (!contacto || !password)
    return res.status(400).send({ response: "ERROR", message: "Datos incompletos" });

  try {
    // 🔎 1️⃣ Buscar al cliente por contacto (porque id es la Key principal)
    const result = await docClient.scan({
      TableName: "cliente",
      FilterExpression: "contacto = :c",
      ExpressionAttributeValues: { ":c": contacto }
    }).promise();

    if (!result.Items.length)
      return res.status(404).send({ response: "ERROR", message: "Cliente no encontrado" });

    const cliente = result.Items[0]; // Obtenemos el cliente completo, incluido su id

    //Actualizar la contraseña usando el id
    const params = {
      TableName: "cliente",
      Key: { id: cliente.id },  // Usar id como Key principal
      UpdateExpression: "SET #p = :p",
      ExpressionAttributeNames: { "#p": "password" },
      ExpressionAttributeValues: { ":p": password },
      ReturnValues: "ALL_NEW"
    };

    docClient.update(params, (err, data) => {
      if (err)
        return res.status(500).send({ response: "ERROR", message: "Error DB: " + err });

      // ✅ Respuesta exitosa
      res.status(200).send({
        response: "OK",
        message: "Password actualizada",
        cliente: data.Attributes
      });
    });

  } catch (error) {
    log.error(`Error al buscar cliente: ${error}`);
    res.status(500).send({ response: "ERROR", message: "Error interno del servidor" });
  }
});

//---------------------------------[ API REST: Tickets ]------------------------------------------

/**
 * Escanea todos los tickets de un cliente dado su correo.
 */
async function scanDbTicket(contacto) {
  const params = {
    TableName: "ticket",
    FilterExpression: 'clienteID = :c',
    ExpressionAttributeValues: { ':c': contacto }
  };

  const result = await docClient.scan(params).promise();
  return result.Items;
}

/**
 * POST /api/listarTicket
 * Devuelve todos los tickets de un cliente (por correo).
 */
app.post('/api/listarTicket', async (req, res) => {
  try {
    // 🔹 Antes recibíamos "contacto", ahora recibimos "id_cliente"
    const { id_cliente } = req.body;

    // Validación de entrada
    if (!id_cliente) {
      return res.status(400).send({
        response: "ERROR",
        message: "ID de cliente no informado"
      });
    }

    log.info(`Buscando tickets del cliente con ID: ${id_cliente}`);

    // 🔹 Llamamos a la función que obtiene los tickets (debe buscar por ID ahora)
    const tickets = await scanDbTicket(id_cliente);

    // Validar si el cliente tiene tickets asociados
    if (!tickets.length) {
      return res.status(404).send({
        response: "ERROR",
        message: "El cliente no tiene tickets"
      });
    }

    // Enviar los tickets al frontend
    res.status(200).send({
      response: "OK",
      data: tickets
    });

  } catch (error) {
    console.error("❌ Error en /api/listarTicket:", error);
    res.status(500).send({
      response: "ERROR",
      message: "Error interno del servidor"
    });
  }
});

/**
 * POST /api/addTicket
 * Crea un nuevo ticket para un cliente.
 */
app.post('/api/addTicket', (req, res) => {
  const { contacto, descripcion, solucion } = req.body;
  const fecha = new Date().toLocaleDateString('es-AR');

  const newTicket = {
    id: crypto.randomUUID(),
    clienteID: contacto,
    estado_solucion: 1,
    descripcion,
    solucion,
    fecha_apertura: fecha,
    ultimo_contacto: fecha
  };

  const params = {
    TableName: "ticket",
    Item: newTicket,
    ConditionExpression: 'attribute_not_exists(id)',
  };

  docClient.put(params, (err) => {
    if (err)
      return res.status(400).send({ response: "ERROR", message: "Error al crear ticket: " + err });

    res.status(200).send({ response: "OK", ticket: newTicket });
  });
});

/**
 * POST /api/getTicket
 * Devuelve los detalles de un ticket específico.
 */
app.post('/api/getTicket', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send({ response: "ERROR", message: "ID de ticket no informado" });

  const params = { TableName: "ticket", Key: { id } };

  docClient.get(params, (err, data) => {
    if (err) return res.status(400).send({ response: "ERROR", message: "Error DB: " + err });
    if (!data.Item) return res.status(400).send({ response: "ERROR", message: "Ticket no encontrado" });

    res.status(200).send({ response: "OK", data: data.Item });
  });
});

/**
 * POST /api/updateTicket
 * Actualiza los datos de un ticket.
 */
app.post('/api/updateTicket', (req, res) => {
  const { id, clienteID, estado_solucion, solucion, descripcion, fecha_apertura } = req.body;

  if (!id || !clienteID)
    return res.status(400).send({ response: "ERROR", message: "Datos incompletos" });

  const fecha = new Date().toLocaleDateString('es-AR');

  const params = {
    TableName: "ticket",
    Key: { id },
    UpdateExpression: `
      SET #c = :c, #e = :e, #s = :s, #d = :d, #a = :a, #u = :u
    `,
    ExpressionAttributeNames: {
      "#c": "clienteID",
      "#e": "estado_solucion",
      "#s": "solucion",
      "#d": "descripcion",
      "#a": "fecha_apertura",
      "#u": "ultimo_contacto"
    },
    ExpressionAttributeValues: {
      ":c": clienteID,
      ":e": estado_solucion,
      ":s": solucion,
      ":d": descripcion,
      ":a": fecha_apertura,
      ":u": fecha
    },
    ReturnValues: "ALL_NEW"
  };

  docClient.update(params, (err, data) => {
    if (err)
      return res.status(400).send({ response: "ERROR", message: "Error DB: " + err });

    res.status(200).send({ response: "OK", ticket: data.Attributes });
  });
});

//---------------------------------[ Fin del servidor ]-------------------------------------------

log.success("API REST lista y segura — Esperando solicitudes...");
