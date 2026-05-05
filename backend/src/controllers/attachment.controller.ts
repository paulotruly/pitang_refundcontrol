import type { Request, Response } from "express";
import { prisma } from "../prisma.js"

export const createAttachment = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;

    const reimbursement = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });

    if (!reimbursement) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (reimbursement.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });

    // req.file é preenchido pelo multer automaticamente
    if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado", statusCode: 400, error: "Bad Request" });
    }

    console.log("FILE:", req.file);
    
    const attachment = await prisma.attachment.create({
        data: {
            solicitacaoId: id,
            nomeArquivo: req.file.originalname,
            urlArquivo: req.file.filename, // vai direto pra pasta uploads
            tipoArquivo: req.file.mimetype,
        },
    });
    res.status(201).json(attachment);
};