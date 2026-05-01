import type { Request, Response, NextFunction } from "express";

// middleware global de erro (catch-all)
// captura QUALQUER erro que não foi tratado nos controllers
// sempre fica no FINAL do app.ts, depois de TODAS as rotas
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err); // log do erro real no console (só visível no servidor, não vai pro cliente)

    // retorna 500 genérico pro cliente — nunca expõe stack trace ou detalhes internos
    res.status(500).json({
        message: "Erro interno no servidor",
        statusCode: 500,
        error: "Internal Server Error",
    });
};