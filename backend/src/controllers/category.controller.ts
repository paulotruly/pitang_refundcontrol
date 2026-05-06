import type { Request, Response } from "express";
import { prisma } from "../prisma.js"
import { error } from "node:console";

export const createCategory = async (req: Request, res: Response) => {
    const { nome, ativo } = req.body;

    const existingCategory = await prisma.category.findFirst({
      where: { nome }
    });

    if (existingCategory) {
        return res.status(400).json({ message: "Já existe uma categoria com esse nome.", statusCode: 400, error: "Bad Request"});
    }

    const category = await prisma.category.create({
        data: { nome, ativo }
    });
    res.status(201).json(category);
};

export const getCategory = async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
    });

    res.json({
        dados: categories,
        paginacao: {
            totalItens: categories.length
        }
    });
};

export const getCategoryById = async (req: Request, res: Response) => {
    const category = await prisma.category.findUnique({
        where: { id: req.params.id as string, deletadoEm: null },
    });
    if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada", statusCode: 404, error: "Not Found" });
    }
    res.json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
    const { nome, ativo } = req.body;
    const data: { nome?: string; ativo?: boolean; } = { nome, ativo };
    try {
        const updatedCategory = await prisma.category.update({
            where: { id: req.params.id as string },
            data,
        });
        res.json(updatedCategory);
    } catch (err: any) {
        if (err.code === "P2025") {
            return res.status(404).json({ message: "Categoria não encontrada", statusCode: 404, error: "Not Found" });
        }
        throw err;
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    // busca apenas se AINDA NÃO estiver deletado
    const existing = await prisma.category.findUnique({
        where: { id: req.params.id as string, deletadoEm: null }
    });

    if (!existing) {
        return res.status(404).json({ message: "Categoria não encontrada", statusCode: 404, error: "Not Found"});
    }

    // marca como deletado
    await prisma.category.update({
        where: { id: req.params.id as string  },
        data: { ativo: false, deletadoEm: new Date() },
    });
    res.json({ message: "Categoria deletada com sucesso" });
};