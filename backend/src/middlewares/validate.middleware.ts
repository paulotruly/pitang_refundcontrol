import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

// declarando uma função que recebe um schema zod como parâmetro
// 'T' pode ser qualquer schema zod
export const validate = <T extends ZodType>(schema: T) => {
    // 
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body); // verifica se o body da requisição segue as regras do schema
            next();
        } catch (error) {
            res.status(400).json({
                message: "Dados inválidos",
                statusCode: 400,
                error: (error as Error).message,
            });
        }
    };
};

// em suma, o validate() é um middleware reutilizável, com ele, podemos validar os dados de todas as rotas que recebem um schema zod