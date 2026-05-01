import type { Request, Response } from "express";
import { prisma } from "../prisma.js"

export const createAttachment = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;
    const { nomeArquivo, urlArquivo, tipoArquivo } = req.body;

    const reimbursement = await prisma.reimbursement.findUnique({ where: { id } });

    if (!reimbursement) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (reimbursement.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });

    const attachment = await prisma.attachment.create({
        data: { solicitacaoId: id, nomeArquivo, urlArquivo, tipoArquivo },
    });
    res.status(201).json(attachment);
};

export const listAttachments = async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const reimbursement = await prisma.reimbursement.findUnique({ where: { id } });
    if (!reimbursement) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    
    const attachments = await prisma.attachment.findMany({ where: { solicitacaoId: id } });
    res.json(attachments);
};