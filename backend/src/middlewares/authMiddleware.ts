import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/api-erros";
import { usuarioRepository } from "../repositories/usuarioRepository";
import jwt from 'jsonwebtoken';

type JwtPayload = {
    id: number;
    role?: string;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.autorizado || req.headers.authorization;

    if (!header || typeof header !== "string") {
        throw new UnauthorizedError('Não autorizado');
    }

    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : header.split(' ')[1];

    if (!token) {
        throw new UnauthorizedError('Não autorizado');
    }

    let id: number;
    try {
        const decoded = jwt.verify(token, process.env.JWT_PASS ?? '') as JwtPayload;
        id = decoded.id;
    } catch {
        throw new UnauthorizedError('Token inválido ou expirado');
    }

    const usuario = await usuarioRepository.findOneBy({ id });

    if (!usuario || !usuario.status) {
        throw new UnauthorizedError('Usuário não encontrado ou inativo');
    }

    const { senha: _, ...usuarioLogado } = usuario;

    req.usuario = usuarioLogado;

    next();
};

export const autorizarPorPerfil = (...perfisPermitidos: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.usuario) {
            await authMiddleware(req, res, () => {});
        }

        const role = req.usuario?.role?.toLowerCase();
        const permitidos = perfisPermitidos.map(p => p.toLowerCase());

        if (!role || !permitidos.includes(role)) {
            throw new ForbiddenError('Acesso negado');
        }

        next();
    };
};