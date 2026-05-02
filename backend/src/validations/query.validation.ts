import { z } from "zod";

const statusValidos = ["RASCUNHO", "ENVIADO", "APROVADO", "REJEITADO", "PAGO", "CANCELADO"] as const;
const camposOrdenacao = ["dataDespesa", "valor", "criadoEm"] as const;
const direcoesOrdenacao = ["asc", "desc"] as const;

export const reembolsoQuerySchema = z.object({
    pagina: z.coerce // converte a string do url pra numero
        .number("Página deve ser um número")
        .int("Deve ser um número inteiro")
        .min(1, "Deve ser maior ou igual a 1")
        .default(1)
        .optional(),

    limite: z.coerce
        .number("Limite deve ser um número")
        .int("Deve ser um número inteiro")
        .min(1, "Deve ser maior ou igual a 1")
        .max(50, "Deve ser no máximo 50")
        .default(10)
        .optional(),

    status: z.enum(statusValidos, "Status inválido")
        .optional(),

    categoria: z.uuid("Categoria deve ser um UUID válido")
        .optional(),

    busca: z.string().min(1, "Busca não pode estar vazio")
        .optional(),

    ordenarPor: z.enum(camposOrdenacao, "'Ordenar por' inválido. Valores aceitos: dataDespesa, valor, criadoEm")
        .default("criadoEm")
        .optional(),

    ordem: z.enum(direcoesOrdenacao, "Ordem inválida. Valores aceitos: asc, desc")
        .default("desc")
        .optional(),
})