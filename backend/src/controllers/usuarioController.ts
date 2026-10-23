import { Request, Response } from "express";
import usuarioService from "../services/usuarioService";
import { BadRequestError } from "../utils/api-erros";

export class UsuarioController {
  async Cadastro(req: Request, res: Response) {
    try {
      if (req.usuario.role !== 'administrador') {
        return res.status(403).json({
          error: "Acesso negado"
        });
      }

      const { nome, email, senha, confirmSenha, role } = req.body;
      const usuario = await usuarioService.Cadastro({
        nome, 
        email, 
        senha, 
        confirmSenha, 
        role
      });

      return res.status(201).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ 
        error: error.message 
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      const result = await usuarioService.login({
        email, 
        senha
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ 
        error: error.message 
      });
    }
  }

  async getPerfil(req: Request, res: Response) {
    return res.json(req.usuario);
  }

  async getUsuarios(req: Request, res: Response) {
    try {
      if (req.usuario.role !== 'administrador') {
        return res.status(403).json({ 
          error: "Acesso negado" 
        });
      }

      const usuario = await usuarioService.getUsuarios();

      return res.json(usuario);
    } catch (error: any) {
      return res.status(400).json({ 
        error: error.message 
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      if (req.usuario.role !== 'administrador') {
        return res.status(403).json({
          error: "Acesso negado"
        });
      }

      const { id } = req.params;
      const { nome, email, role, status } = req.body;
      const usuario = await usuarioService.atualizar({
        id, 
        nome, 
        email, 
        role, 
        status
      });

      return res.json(usuario);
    } catch (error: any) {
      return res.status(400).json({ 
        error: error.message 
      });
    }
  }

  async inativar(req: Request, res: Response) {
    try {
      if (req.usuario.role !== 'administrador') {
        return res.status(403).json({
          error: "Acesso negado"
        });
      }

      const id = Number(req.params.id);
      const usuarioLogado = req.usuario;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          error: "ID inválido"
        });
      }

      if (!usuarioLogado?.id) {
        return res.status(401).json({
          error: "Usuário não autenticado"
        });
      }

      await usuarioService.inativar(id, usuarioLogado.id);

      return res.status(200).json({
        message: "Usuário inativado com sucesso"
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message
      });
    }
  }

  async reativar(req: Request, res: Response) {
    try {
      if (req.usuario.role !== 'administrador') {
        return res.status(403).json({
          error: "Acesso negado"
        });
      }

      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          error: "ID inválido"
        });
      }

      await usuarioService.reativar(id);

      return res.status(200).json({
        message: "Usuário reativado com sucesso"
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message
      });
    }
  }

  async redefinirSenha(req: Request, res: Response) {
    try {
      const { email, newSenha, confirmSenha } = req.body;
      const result = await usuarioService.redefinirSenha({
        email, 
        newSenha, 
        confirmSenha
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}