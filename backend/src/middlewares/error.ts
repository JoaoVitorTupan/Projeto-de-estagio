import {NextFunction, Request, Response} from "express";
import { ApiError } from "../utils/api-erros";

export const errorMiddleware = (
    error: Error & Partial<ApiError>, 
    req: Request, res: Response, 
    next: NextFunction) => {
        
    const statusCode = error.statusCode ?? 500;
    const message = error.statusCode ? error.message : "Internal Server Error";

    if (statusCode === 500) {
        console.error("ERRO NO BACKEND");
        console.error("Mensagem:", error.message);
        console.error("Stack:", error.stack);
        console.error("Status:", statusCode);
        console.error("Método:", req.method);
        console.error("URL:", req.originalUrl);
    }

    return res.status(statusCode).json({ message, error: message });
};