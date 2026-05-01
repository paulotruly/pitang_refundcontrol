import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

// aceita qualquer schema zod
export const validate = <T extends ZodType>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // safeParse valida SEM lançar erro. retorna { success: true, data } ou { success: false, error }
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Dados inválidos",
                statusCode: 400,
                error: "Validation failed",
            });
        }
        req.body = result.data;
        next();
    };
};