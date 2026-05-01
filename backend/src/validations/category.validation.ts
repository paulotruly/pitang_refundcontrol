import { z } from "zod";

export const createCategorySchema = z.object({
    nome: z.string().min(1),
    ativo: z.boolean().optional()
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;