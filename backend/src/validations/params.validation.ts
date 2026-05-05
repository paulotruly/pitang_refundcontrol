import { z } from "zod";

export const idParamsSchema = z.object({
    id: z.uuid({ message: "ID inválido" }),
});


export const attachmentParamsSchema = z.object({
    id: z.uuid({ message: "ID inválido" }),
    attachmentId: z.uuid()
});