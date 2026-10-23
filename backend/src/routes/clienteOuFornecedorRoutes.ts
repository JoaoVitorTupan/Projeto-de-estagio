import { Router } from "express";
import { ClienteOuFornecedorController } from "../controllers/clienteOuFornecedorController";
import { authMiddleware, autorizarPorPerfil } from "../middlewares/authMiddleware";

const clienteOuFornecedorRoutes = Router();
const controller = new ClienteOuFornecedorController();

clienteOuFornecedorRoutes.use(authMiddleware, autorizarPorPerfil("administrador", "gestor", "financeiro"));
clienteOuFornecedorRoutes.get("/", controller.listar);
clienteOuFornecedorRoutes.post("/", controller.cadastrar);
clienteOuFornecedorRoutes.put("/:id", controller.atualizar);
clienteOuFornecedorRoutes.patch("/inativar/:id", controller.inativar);

export default clienteOuFornecedorRoutes;