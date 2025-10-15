/**
 * app.js
 * Configuración principal de la app Express
 * TP Mesa de Ayuda - Backend modular
 */

import express from "express";
import path from "path";
import clientesRoutes from "./routes/clientes.routes.js";
import ticketsRoutes from "./routes/tickets.routes.js";

const app = express();

// -----------------------------------------------------------------------------
// 1️⃣ Middlewares para parsear JSON y formularios
// -----------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------------------
// 2️⃣ Servir archivos estáticos del frontend
// -----------------------------------------------------------------------------
app.use(express.static(path.join('.', 'public')));

// -----------------------------------------------------------------------------
// 3️⃣ Rutas de API
// -----------------------------------------------------------------------------
app.use("/clientes", clientesRoutes);  // login, registro, reset password
app.use("/tickets", ticketsRoutes);    // listar tickets, crear tickets, etc.

// -----------------------------------------------------------------------------
// 4️⃣ Ruta por defecto (opcional) para ir a index.html
// -----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join('.', 'public', 'index.html'));
});

// -----------------------------------------------------------------------------
// 5️⃣ Exportar app para server.js o pruebas
// -----------------------------------------------------------------------------
export default app;
