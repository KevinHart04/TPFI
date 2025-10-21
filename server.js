import express from "express";
import log from "./utils/logger.js";
import cors from "cors";
import 'dotenv/config';
import clientesRouter from "./routes/clientes.routes.js";
import ticketsRouter from "./routes/tickets.routes.js";


const app = express();
const PORT = 3000;

// Configuración básica
app.use(cors());
app.use(express.json());
app.use('/clientes', clientesRouter);
app.use('/tickets', ticketsRouter);


// ---------------------------------[ Endpoints ]---------------------------------
app.get("/api/cliente", (req, res) => {
  log.info("Ping API Cliente recibido");
  res.status(200).send({ response: "OK", message: "API Cliente disponible" });
});

// ---------------------------------[ Servidor ]---------------------------------
app.listen(PORT, () => {
  log.success(`Servidor escuchando en http://localhost:${PORT}`);
});
