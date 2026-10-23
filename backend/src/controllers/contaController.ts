import { Request, Response } from "express";
import { ContaService } from "../services/contaService";

export class ContaController {
    private contaService = new ContaService();

    constructor() {
        this.listar = this.listar.bind(this);
        this.buscarPorId = this.buscarPorId.bind(this);
        this.cadastrar = this.cadastrar.bind(this);
        this.atualizar = this.atualizar.bind(this);
        this.marcarComoPago = this.marcarComoPago.bind(this);
        this.marcarComoRecebido = this.marcarComoRecebido.bind(this);
        this.excluir = this.excluir.bind(this);
    }

    async listar(req: Request, res: Response) {
        try {
            const contas = await this.contaService.listar();

            return res.json(contas);
        } catch (error: any) {
            console.error("Erro ao listar contas:", error);

            return res.status(500).json({
                error: error.message || "Não foi possível listar as contas."
            });
        }
    }

    async buscarPorId(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: "ID da conta inválido."
                });
            }

            const conta = await this.contaService.buscarPorId(id);

            return res.json(conta);
        } catch (error: any) {
            console.error("Erro ao buscar conta:", error);

            return res.status(404).json({
                error: error.message || "Conta não encontrada."
            });
        }
    }

    async cadastrar(req: Request, res: Response) {
        try {
            if (!req.usuario || !req.usuario.id) {
                return res.status(401).json({
                    error: "Usuário não autenticado."
                });
            }

            const usuarioId = Number(req.usuario.id);

            if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
                return res.status(401).json({
                    error: "Usuário autenticado inválido."
                });
            }

            const conta = await this.contaService.cadastrar(req.body, {id: usuarioId});

            return res.status(201).json(conta);
        } catch (error: any) {
            console.error("ERRO AO CADASTRAR CONTA");
            console.error("Mensagem:", error.message);
            console.error("Stack:", error.stack);

            return res.status(400).json({
                error: error.message || "Não foi possível cadastrar a conta."
            });

        }
    }

    async atualizar(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: "ID da conta inválido."
                });
            }

            const conta = await this.contaService.atualizar(id, req.body);

            return res.json(conta);
        } catch (error: any) {
            console.error("Erro ao atualizar conta:", error);

            return res.status(400).json({
                error: error.message || "Não foi possível atualizar a conta."
            });
        }
    }

    async marcarComoPago(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: "ID da conta inválido."
                });
            }

            const conta = await this.contaService.marcarComoPago(id);

            return res.json(conta);
        } catch (error: any) {
            console.error("Erro ao marcar conta como paga:", error);

            return res.status(400).json({
                error: error.message || "Não foi possível marcar a conta como paga."
            });

        }
    }

    async marcarComoRecebido(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: "ID da conta inválido."
                });
            }

            const conta = await this.contaService.marcarComoRecebido(id);

            return res.json(conta);
        } catch (error: any) {
            console.error("Erro ao marcar conta como recebida:",error);

            return res.status(400).json({
                error: error.message || "Não foi possível marcar a conta como recebida."
            });
        }

    }

    async excluir(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: "ID da conta inválido."
                });
            }

            await this.contaService.excluir(id);

            return res.status(204).send();
        } catch (error: any) {
            console.error("Erro ao excluir conta:", error);
            return res.status(400).json({
                error: error.message || "Não foi possível excluir a conta."
            });

        }
    }
}