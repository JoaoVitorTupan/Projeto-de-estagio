import { Router } from "express";
import usuarioRoutes from "./usuarioRoutes";
import clienteOuFornecedorRoutes from "./clienteOuFornecedorRoutes";
import planoDeContaRoutes from "./planoDeContaRoutes";
import contaRoutes from "./contaRoutes";
import relatorioRoutes from "./relatorioRoutes";
import dashboardRoutes from "./dashboardRoutes";

const routes = Router();

routes.use("/usuarios", usuarioRoutes);
routes.use("/clientes-fornecedores", clienteOuFornecedorRoutes);
routes.use("/planos-de-conta", planoDeContaRoutes);
routes.use("/contas", contaRoutes);
routes.use("/relatorios", relatorioRoutes);
routes.use("/dashboard", dashboardRoutes);

export default routes;