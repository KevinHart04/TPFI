import { Router } from "express";
import { listarTickets, addTicket, getTicket, updateTicket } from "../controllers/tickets.controller.js";

const router = Router();

router.post("/listarTicket", listarTickets);
router.post("/addTicket", addTicket);
router.post("/getTicket", getTicket);
router.post("/updateTicket", updateTicket);

export default router;
