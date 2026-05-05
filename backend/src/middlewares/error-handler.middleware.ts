import type { Request, Response, NextFunction } from "express";
import multer from "multer";

// middleware global de erro (catch-all)
// captura QUALQUER erro que não foi tratado nos controllers
// sempre fica no FINAL do app.ts, depois de TODAS as rotas
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err); // log do erro real no console (só visível no servidor, não vai pro cliente)

    // erro de tamanho de arquivo (multer)
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Arquivo muito grande (máx 5MB)",
                statusCode: 400,
                error: "Bad Request",
            });
        }
    }

    // erro de tipo/extensão (do teu fileFilter ou filename)
    if (err.message?.includes("Tipo de arquivo") || err.message?.includes("Extensão")) {
        return res.status(400).json({
            message: err.message,
            statusCode: 400,
            error: "Bad Request",
        });
    }

    // fallback padrão
    res.status(500).json({
        message: "Erro interno no servidor",
        statusCode: 500,
        error: "Internal Server Error",
    });
};