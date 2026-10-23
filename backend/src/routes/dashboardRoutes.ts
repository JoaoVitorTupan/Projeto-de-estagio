import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController";
import { authMiddleware, autorizarPorPerfil } from "../middlewares/authMiddleware";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get("/", authMiddleware, autorizarPorPerfil("administrador", "gestor"), dashboardController.buscar.bind(dashboardController));

export default dashboardRoutes;

