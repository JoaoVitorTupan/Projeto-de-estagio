import { Request, Response } from "express";
import PlanoDeContaService from "../services/planoDeContaService";

export class PlanoDeContaController {

    async listar(req: Request, res: Response) {
        const planosDeContas = await PlanoDeContaService.listar();

        return res.json(planosDeContas);
    }

    async cadastrar(req: Request, res: Response) {
        if (req.usuario.role !== "administrador") {
            return res.status(403).json({
                error: "Acesso negado"
            });
        }

        const planoDeConta = await PlanoDeContaService.cadastrar(req.body);

        return res.status(201).json(planoDeConta);
    }

    async atualizar(req: Request, res: Response) {
        if (req.usuario.role !== "administrador") {
            return res.status(403).json({
                error: "Acesso negado"
            });
        }

        const { id } = req.params;
        const planoDeConta = await PlanoDeContaService.atualizar(Number(id), req.body);

        return res.json(planoDeConta);
    }

    async inativar(req: Request, res: Response) {
        if (req.usuario.role !== "administrador") {
            return res.status(403).json({
                error: "Acesso negado"
            });
        }

        const { id } = req.params;
        const planoDeConta = await PlanoDeContaService.inativar(Number(id));

        return res.json(planoDeConta);
    }

    async reativar(req: Request, res: Response) {
        if (req.usuario.role !== "administrador") {
            return res.status(403).json({
                error: "Acesso negado"
            });
        }

        const { id } = req.params;
        const planoDeConta = await PlanoDeContaService.reativar(Number(id));

        return res.json(planoDeConta);
    }
}