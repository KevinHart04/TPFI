/**
 * tickets.controller.js
 * Controladores de tickets
 */
import { v4 as uuidv4 } from "uuid";

import { getTicketsByClienteId, addTicketDB, getTicketByIdDB, updateTicketDB } from "../services/tickets.service.js";

/**
 * Listar tickets de un cliente
 * POST /api/listarTicket
 */
export const listarTickets = async (req, res) => {
  try {
    const { id_cliente } = req.body;
    if (!id_cliente) return res.status(400).json({ response: "ERROR", message: "Falta id_cliente" });

    const tickets = await getTicketsByClienteId(id_cliente);
    res.json({ response: "OK", data: tickets });
  } catch (error) {
    console.error("Error en listarTickets:", error);
    res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
  }
};

/**
 * Agregar un nuevo ticket
 * POST /api/addTicket
 */
export const addTicket = async (req, res) => {
  try {
    const { id_cliente, descripcion } = req.body;
    if (!id_cliente || !descripcion) {
      return res.status(400).json({ response: "ERROR", message: "Faltan datos del ticket" });
    }

    // Construimos el objeto ticket completo en el controlador
    const nuevoTicket = {
      id: uuidv4(), // Generamos un ID único
      clienteID: id_cliente,
      descripcion: descripcion,
      solucion: "", // Inicialmente sin solución
      estado: "Pendiente", // Estado inicial
      fecha_apertura: new Date().toLocaleDateString('es-AR')
    };
    const creado = await addTicketDB(nuevoTicket);
    res.json({ response: "OK", data: creado });
  } catch (error) {
    console.error("Error en addTicket:", error);
    res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
  }
};

/**
 * Obtener un ticket por ID
 * POST /api/getTicket
 */
export const getTicket = async (req, res) => {
  try {
    const { id_ticket } = req.body;
    if (!id_ticket) return res.status(400).json({ response: "ERROR", message: "Falta id_ticket" });

    const ticket = await getTicketByIdDB(id_ticket);
    if (!ticket) return res.status(404).json({ response: "ERROR", message: "Ticket no encontrado" });

    res.json({ response: "OK", data: ticket });
  } catch (error) {
    console.error("Error en getTicket:", error);
    res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
  }
};

/**
 * Actualizar un ticket existente
 * POST /api/updateTicket
 */
export const updateTicket = async (req, res) => {
  try {
    const ticket = req.body;
    if (!ticket.id_ticket) return res.status(400).json({ response: "ERROR", message: "Falta id_ticket" });

    const actualizado = await updateTicketDB(ticket);
    res.json({ response: "OK", data: actualizado });
  } catch (error) {
    console.error("Error en updateTicket:", error);
    res.status(500).json({ response: "ERROR", message: "Error interno del servidor" });
  }
};
