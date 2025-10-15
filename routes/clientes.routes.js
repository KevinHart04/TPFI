// routes/clientes.routes.js
import { Router } from "express";
import { loginCliente, registrarCliente, resetPassword } from "../controllers/clientes.controller.js";

const router = Router();

router.post("/login", loginCliente);
router.post("/registro", registrarCliente);
router.post("/resetPassword", resetPassword);

export default router;
