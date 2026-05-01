import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().pipe(z.email()),
    senha: z.string().min(1),
});

export const registerSchema = z.object({
    nome: z.string().min(1),
    email: z.string().trim().pipe(z.email()),
    senha: z.string().min(1),
});

export type CreateLoginInput = z.infer<typeof loginSchema>;
export type CreateRegisterInput = z.infer<typeof registerSchema>;