import { Router } from "express";
import { RelatorioController } from "../controllers/relatorioController";
import { authMiddleware, autorizarPorPerfil } from "../middlewares/authMiddleware";

const relatorioRoutes = Router();
const relatorioController = new RelatorioController();

relatorioRoutes.use(authMiddleware, autorizarPorPerfil("administrador", "gestor"));

relatorioRoutes.get("/opcoes", relatorioController.opcoes.bind(relatorioController));
relatorioRoutes.get("/contas", relatorioController.buscar.bind(relatorioController));
relatorioRoutes.get("/contas/pdf", relatorioController.pdf.bind(relatorioController));
relatorioRoutes.get("/contas/excel", relatorioController.excel.bind(relatorioController));

export default relatorioRoutes;