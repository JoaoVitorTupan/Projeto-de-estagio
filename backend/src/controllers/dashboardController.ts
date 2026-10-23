import { Request, Response } from "express";
import { DashboardService, FiltrosDashboard } from "../services/dashboardService";
import { ApiError } from "../utils/api-erros";

export class DashboardController {
    private dashboardService = new DashboardService();

    private obterFiltros(req: Request): FiltrosDashboard {
        const query = req.query;
        const filtros: FiltrosDashboard = {};

        if (typeof query.mes === "string" && query.mes.trim()) {
            filtros.mes = Number(query.mes);
        }

        if (typeof query.ano === "string" && query.ano.trim()) {
            filtros.ano = Number(query.ano);
        }

        return filtros;
    }

    async buscar(req: Request, res: Response) {
        try {
            const filtros = this.obterFiltros(req);
            const dashboard = await this.dashboardService.gerarDashboard(filtros);

            return res.json(dashboard);
        } catch (
            error: any
        ) {
            console.error("Erro ao gerar dashboard:", error);

            const status = error instanceof ApiError ? error.statusCode : 500;

            return res.status(status).json({
                error: status === 500
                    ? "Não foi possível carregar os dados do dashboard."
                    : error.message
            });
        }
    }
}
