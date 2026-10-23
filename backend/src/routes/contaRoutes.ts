import { Router } from "express";
import { ContaController } from "../controllers/contaController";
import { authMiddleware, autorizarPorPerfil } from "../middlewares/authMiddleware";

const contaRoutes = Router();
const contaController = new ContaController();

contaRoutes.use(authMiddleware, autorizarPorPerfil("administrador", "gestor", "financeiro"));

contaRoutes.get("/", contaController.listar.bind(contaController));
contaRoutes.get("/:id", contaController.buscarPorId.bind(contaController));
contaRoutes.post("/", contaController.cadastrar.bind(contaController));
contaRoutes.put("/:id", contaController.atualizar.bind(contaController));
contaRoutes.put("/:id/pagar", contaController.marcarComoPago.bind(contaController));
contaRoutes.put("/:id/receber", contaController.marcarComoRecebido.bind(contaController));
contaRoutes.delete("/:id", contaController.excluir.bind(contaController));

export default contaRoutes;