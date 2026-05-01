import type { Request, Response } from "express";
import { prisma } from "../prisma.js"

export const createReimbursement = async (req: Request, res: Response) => {
    const { categoriaId, descricao, valor, dataDespesa } = req.body;
    
    // verificando se a categoria existe
    const category = await prisma.category.findUnique({
        where: {id: categoriaId},
    })
    if (!category) {
        return res.status(400).json({ message: "Categoria não existe" });
    }
    if (!category.ativo) {
        return res.status(400).json({ message: "Categoria inativa não pode ser usada" });
    }
   
    const reimbursement = await prisma.reimbursement.create({
        data: {
            solicitanteId: req.user.sub,
            categoriaId,
            descricao,
            valor,
            dataDespesa,
            status: "RASCUNHO"
         }
    });

    await prisma.history.create({
        data: { solicitacaoId: reimbursement.id, usuarioId: req.user.sub, acao: "CREATED" },
    });

    res.status(201).json(reimbursement);
};

export const getReimbursement = async (req: Request, res: Response) => {
    const { sub: userId, perfil } = req.user;
    let where: object;

    switch (perfil) {
        case "COLABORADOR":
            where = { solicitanteId: userId };
            break;
        case "GESTOR":
            where = { status: "ENVIADO" };
            break;
        case "FINANCEIRO":
            where = { status: "APROVADO" };
            break;
        case "ADMIN":
        default:
            where = {};
            break;
    }
    const reimbursements = await prisma.reimbursement.findMany({
        where,
        include: { categoria: true, solicitante: { select: { nome: true, email: true } } },
    });
    res.json(reimbursements);
};

export const getReimbursementById = async (req: Request, res: Response) => {
    const { sub: userId, perfil } = req.user;
    const id = req.params.id as string;

    const reimbursement = await prisma.reimbursement.findUnique({
        where: { id },
        include: { 
            categoria: true, 
            solicitante: { select: { nome: true, email: true } } 
        },
    });

    if (!reimbursement) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
    }

    if (perfil !== "ADMIN" && reimbursement.solicitanteId !== userId) {
        return res.status(403).json({ message: "Sem permissão para ver esta solicitação" });
    }
    res.json(reimbursement);
};

export const updateReimbursement = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;

    const existing = await prisma.reimbursement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada" });
    if (existing.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão" });
    if (existing.status !== "RASCUNHO") return res.status(400).json({ message: "Só pode editar em RASCUNHO" });

    const { categoriaId, descricao, valor, dataDespesa } = req.body;

    if (categoriaId) {
        const category = await prisma.category.findUnique({ where: { id: categoriaId } });
        if (!category) return res.status(400).json({ message: "Categoria não existe" });
        if (!category.ativo) return res.status(400).json({ message: "Categoria inativa não pode ser usada" });
    }

    const data: any = {};
    if (categoriaId !== undefined) data.categoriaId = categoriaId;
    if (descricao !== undefined) data.descricao = descricao;
    if (valor !== undefined) data.valor = valor;
    if (dataDespesa !== undefined) data.dataDespesa = dataDespesa;

    const updated = await prisma.reimbursement.update({ where: { id }, data });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "UPDATED" },
    });

    res.json(updated);
};

export const submitReimbursement = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;

    const existing = await prisma.reimbursement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada" });
    if (existing.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão" });
    if (existing.status !== "RASCUNHO") return res.status(400).json({ message: "Só pode enviar solicitação em RASCUNHO" });

    const updated = await prisma.reimbursement.update({
        where: { id },
        data: { status: "ENVIADO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "SUBMITTED" },
    });

    res.json(updated);
};

export const approveReimbursement = async (req: Request, res: Response) => {
    const { perfil } = req.user;
    const id = req.params.id as string;

    if (perfil !== "GESTOR") return res.status(403).json({ message: "Apenas gestores podem aprovar" });

    const existing = await prisma.reimbursement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada" });
    if (existing.status !== "ENVIADO") return res.status(400).json({ message: "Só pode aprovar solicitação ENVIADA" });

    const updated = await prisma.reimbursement.update({
        where: { id },
        data: { status: "APROVADO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: req.user.sub, acao: "APPROVED" },
    });

    res.json(updated);
};

export const rejectReimbursement = async (req: Request, res: Response) => {
    const { perfil, sub: userId } = req.user;
    const id = req.params.id as string;
    const { justificativaRejeicao } = req.body;

    if (perfil !== "GESTOR") return res.status(403).json({ message: "Apenas gestores podem rejeitar" });

    const existing = await prisma.reimbursement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada" });
    if (existing.status !== "ENVIADO") return res.status(400).json({ message: "Só pode rejeitar solicitação ENVIADA" });
    if (!justificativaRejeicao || justificativaRejeicao.trim() === "") {
        return res.status(400).json({ message: "Justificativa é obrigatória" });
    }

    const updated = await prisma.reimbursement.update({
        where: { id },
        data: { status: "REJEITADO", justificativaRejeicao },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "REJECTED", observacao: justificativaRejeicao },
    });

    res.json(updated);
};

export const payReimbursement = async (req: Request, res: Response) => {
    const { perfil } = req.user;
    const id = req.params.id as string;

    if (perfil !== "FINANCEIRO") return res.status(403).json({ message: "Apenas financeiro pode marcar como pago" });

    const existing = await prisma.reimbursement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada" });
    if (existing.status !== "APROVADO") return res.status(400).json({ message: "Só pode pagar solicitação APROVADA" });

    const updated = await prisma.reimbursement.update({
        where: { id },
        data: { status: "PAGO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: req.user.sub, acao: "PAID" },
    });

    res.json(updated);
};

export const cancelReimbursement = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;

    const existing = await prisma.reimbursement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada" });
    if (existing.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão" });
    if (existing.status !== "RASCUNHO") return res.status(400).json({ message: "Só pode cancelar solicitação em RASCUNHO" });

    const updated = await prisma.reimbursement.update({
        where: { id },
        data: { status: "CANCELADO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "CANCELED" },
    });

    res.json(updated);
};

export const getReimbursementHistory = async (req: Request, res: Response) => {
    const { sub: userId, perfil } = req.user;
    const id = req.params.id as string;
    const existing = await prisma.reimbursement.findUnique({ where: { id } });

    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada" });

    if (perfil !== "ADMIN" && perfil !== "GESTOR" && perfil !== "FINANCEIRO" && existing.solicitanteId !== userId) {
        return res.status(403).json({ message: "Sem permissão" });
    }

    const history = await prisma.history.findMany({
        where: { solicitacaoId: id },
        include: { usuario: {select: {nome: true, email: true}} },
        orderBy: { criadoEm: "asc" },
    });

    res.json(history);
}