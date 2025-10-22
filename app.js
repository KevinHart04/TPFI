//[+] Configuración de la aplicación Express

import express from "express";
import path from "path";
import clientesRoutes from "./routes/clientes.routes.js";
import ticketsRoutes from "./routes/tickets.routes.js";

const app = express();

//-Json y Form Parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//-Sirve archivos estáticos desde la carpeta "public"
app.use(express.static(path.join('.', 'public')));

//- Rutas de la API
app.use("/clientes", clientesRoutes);  // login, registro, reset password
app.use("/tickets", ticketsRoutes);    // listar tickets, crear tickets, etc.

//-Ruta para servir el archivo loginClient.html
app.get("/", (req, res) => {
  res.sendFile(path.join('.', 'public', 'loginClient.html'));
});

//-Exportar la aplicación para usar en server.js
export default app;
