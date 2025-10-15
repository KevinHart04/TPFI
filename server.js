import express from "express";
import cors from "cors";
import AWS from "aws-sdk";
import log from "./utils/logger.js";
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

// ---------------------------------[ AWS DynamoDB ]---------------------------------
const awsConfig = {
  region: process.env.AWS_REGION,
  endpoint: "http://dynamodb.us-east-1.amazonaws.com", // opcional si usas AWS real
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

AWS.config.update(awsConfig);
const docClient = new AWS.DynamoDB.DocumentClient();

log.info("📦 DynamoDB configurado correctamente.");


// ---------------------------------[ Endpoints ]---------------------------------
app.get("/api/cliente", (req, res) => {
  log.info("Ping API Cliente recibido");
  res.status(200).send({ response: "OK", message: "API Cliente disponible" });
});

// ---------------------------------[ Servidor ]---------------------------------
app.listen(PORT, () => {
  log.success(`Servidor escuchando en http://localhost:${PORT}`);
});
