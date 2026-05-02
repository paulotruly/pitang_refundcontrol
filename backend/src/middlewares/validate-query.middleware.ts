import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

//                             recebe um schema zod qualquer
export const validateQuery = <T extends ZodType>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        
        // tenta validar sem lançar erro, ele retorna {success: true ou false, data ou error}
        const result = schema.safeParse(req.query); // req.query é o objeto com os query params da URL
        // ou seja, ?pagina=2&limite=5 por exemplo, vira {pagina: '2', limite: '5'}

        if (!result.success) {
            return res.status(400).json({
                message: "Query params inválidos",
                statusCode: 400,
                error: "Bad Request",
                    // lista de todos os erros que o zod encontrou
                details: result.error.issues.map((e) => ({ // pra cada erro, ele cria um objeto no formato a seguir
                    field: e.path.join("."), // pega o caminho do campo ["pagina"] e vira string "pagina"
                    message: e.message, // e a mensagem do erro que o zod já gera automaticamente
                })),
            });
        }

        // caso tudo dê certo, ele só continua
        req.query = result.data as any;
        next();
    };
};