import { z } from "zod";

export const createUserSchema = z.object({
    nome: z.string().min(1),
    email: z.string().trim().pipe(z.email()),
    senha: z.string().min(6),
    perfil: z.enum(["COLABORADOR", "GESTOR", "FINANCEIRO", "ADMIN"]).optional(),
});

export const loginSchema = z.object({
    email: z.string().trim().pipe(z.email()),
    senha: z.string().min(1),
});

// serve pra validar o body da requisição antes de chegar no controller
export type CreateUserInput = z.infer<typeof createUserSchema>;