import { z } from "zod";

export const createReimbursementSchema = z.object({
    categoriaId: z.string().min(1),
    descricao: z.string().min(1),
    valor: z.number().positive("Valor deve ser maior que zero"),
    dataDespesa: z.string().pipe(z.coerce.date()).refine(
    (date) => date <= new Date(),
    "Data da despesa não pode ser futura"
    ),
});

export const updateReimbursementSchema = z.object({
    categoriaId: z.string().optional(),
    descricao: z.string().min(1).optional(),
    valor: z.number().positive("Valor deve ser maior que zero").optional(),
    dataDespesa: z.string().pipe(z.coerce.date()).refine(
    (date) => date <= new Date(),
    "Data da despesa não pode ser futura"
    ).optional(),
});

export const rejectSchema = z.object({
    justificativaRejeicao: z.string().min(1)
});

export type CreateReimbursementInput = z.infer<typeof createReimbursementSchema>;
export type UpdateReimbursementInput = z.infer<typeof updateReimbursementSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;