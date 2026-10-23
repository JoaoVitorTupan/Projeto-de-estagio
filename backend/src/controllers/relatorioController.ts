import { Request, Response } from "express";
import { FiltrosRelatorio, RelatorioService} from "../services/relatorioService";

export class RelatorioController {
    private relatorioService = new RelatorioService();

    private obterFiltros(req: Request): FiltrosRelatorio {
        const query = req.query;
        const filtros: FiltrosRelatorio = {};

        if (typeof query.dataInicial === "string" && query.dataInicial.trim()) {
            filtros.dataInicial = query.dataInicial.trim();
        }

        if (typeof query.dataFinal === "string" && query.dataFinal.trim()) {
            filtros.dataFinal = query.dataFinal.trim();
        }

        if (typeof query.clienteOuFornecedorId === "string" && query.clienteOuFornecedorId.trim()) {
            const id = Number(query.clienteOuFornecedorId);

            if (Number.isInteger(id)) {
                filtros.clienteOuFornecedorId = id;
            }
        }

        if (typeof query.planoDeContaId === "string" && query.planoDeContaId.trim()) {
            const id = Number(query.planoDeContaId);

            if (Number.isInteger(id)) {
                filtros.planoDeContaId = id;
            }
        }

        if (query.tipo === "receita" || query.tipo === "despesa") {
            filtros.tipo = query.tipo;
        }

        if (query.status === "aberto" || query.status === "vencido" || query.status === "pago" || query.status ==="recebido") {
            filtros.status = query.status;
        }

        if (typeof query.usuarioId === "string" && query.usuarioId.trim()) {
            const id = Number(query.usuarioId);

            if (Number.isInteger(id)) {
                filtros.usuarioId = id;
            }
        }

        if (typeof query.valorMinimo === "string" && query.valorMinimo.trim()) {
            const valor = Number(query.valorMinimo);

            if (Number.isFinite(valor)) {
                filtros.valorMinimo = valor;
            }
        }

        if (typeof query.valorMaximo === "string" && query.valorMaximo.trim()) {
            const valor = Number(query.valorMaximo);

            if (Number.isFinite(valor)) {
                filtros.valorMaximo = valor;
            }
        }

        if (typeof query.ordenarPor === "string" && query.ordenarPor.trim()) {
            filtros.ordenarPor = query.ordenarPor.trim();
        }

        if (query.ordem === "asc" || query.ordem === "desc") {
            filtros.ordem = query.ordem;
        }

        return filtros;
    }

    async buscar(req: Request, res: Response) {
        try {
            const filtros = this.obterFiltros(req);
            const relatorio = await this.relatorioService.gerarRelatorio(filtros);

            return res.json(relatorio);
        } catch (
            error: any
        ) {
            console.error("Erro ao gerar relatório:", error);

            return res.status(400).json({
                error: error.message || "Não foi possível gerar o relatório."
            });
        }
    }

    async opcoes(req: Request, res: Response) {
        try {
            const opcoes = await this.relatorioService.buscarOpcoes();

            return res.json(opcoes);
        } catch (
            error: any
        ) {
            console.error("Erro ao carregar opções do relatório:", error);

            return res.status(500).json({
                error: error.message || "Não foi possível carregar as opções."
            });
        }
    }

    async pdf(req: Request, res: Response) {
        try {
            const filtros = this.obterFiltros(req);
            const arquivo = await this.relatorioService.gerarPDF(filtros);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="relatorio-contas.pdf"');

            return res.send(arquivo);
        } catch (
            error: any
        ) {
            console.error("Erro ao gerar PDF:", error);

            return res.status(400).json({
                error: error.message || "Não foi possível gerar o PDF."
            });
        }
    }

    async excel(req: Request, res: Response) {
        try {
            const filtros = this.obterFiltros(req);
            const arquivo = await this.relatorioService.gerarExcel(filtros);

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", 'attachment; filename="relatorio-contas.xlsx"');

            return res.send(arquivo);
        } catch (
            error: any
        ) {
            console.error("Erro ao gerar Excel:", error);

            return res.status(400).json({
                error: error.message || "Não foi possível gerar o Excel."
            });
        }
    }
}