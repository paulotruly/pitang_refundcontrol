import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

// em suma, esse middleware serve pra EVITAR que o id que é enviado na rota seja um UUID inválido

export const validateParams = <T extends ZodType>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            return res.status(400).json({
                message: "Parâmetro inválido",
                statusCode: 400,
                error: "Bad Request",
            });
        }
        next();
    };
};