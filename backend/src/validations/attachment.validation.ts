import { z } from "zod";

const ALLOWED_TYPES = ["PDF", "JPG", "PNG"] as const;

export const createAttachmentSchema = z.object({
    nomeArquivo: z.string().min(1),
    urlArquivo: z.string().min(1),
    tipoArquivo: z.enum(ALLOWED_TYPES),
});

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;