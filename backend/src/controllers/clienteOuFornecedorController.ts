import { Request, Response } from "express";
import ClienteOuFornecedorService from "../services/clienteOuFornecedorService";

export class ClienteOuFornecedorController {

  async listar(req: Request, res: Response) {
    const clientesOuFornecedores = await ClienteOuFornecedorService.listar();
    return res.json(clientesOuFornecedores);
  }

  async cadastrar(req: Request, res: Response) {
    const clienteOuFornecedor = await ClienteOuFornecedorService.cadastrar(req.body);
    return res.status(201).json(clienteOuFornecedor);
  }

  async atualizar(req: Request, res: Response) {
    const { id } = req.params;
    const clienteOuFornecedor = await ClienteOuFornecedorService.atualizar(Number(id), req.body);
    return res.json(clienteOuFornecedor);
  }

  async inativar(req: Request, res: Response) {
    const { id } = req.params;
    const clienteOuFornecedor = await ClienteOuFornecedorService.inativar(Number(id));
    return res.json(clienteOuFornecedor);
  }
}