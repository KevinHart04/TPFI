// routes/clientes.routes.js
import { Router } from "express";
import { loginCliente, registrarCliente, resetPassword, listarClientes } from "../controllers/clientes.controller.js";

const router = Router();

router.post("/login", loginCliente);
router.post("/registro", registrarCliente);
router.post("/resetPassword", resetPassword);
router.get("/listar", listarClientes); // Nueva ruta para listar todos los clientes

export default router;
