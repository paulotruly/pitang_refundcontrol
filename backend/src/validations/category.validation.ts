import { z } from "zod";

export const createCategorySchema = z.object({
    nome: z.string().min(1),
    ativo: z.boolean().optional()
});

export const updateCategorySchema = z.object({
  nome: z.string().optional(),
  ativo: z.boolean().optional(),
  deletadoEm: z.string().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;