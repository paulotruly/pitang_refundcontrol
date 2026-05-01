import type { Request, Response } from "express";
import { prisma } from "../prisma.js"

export const createCategory = async (req: Request, res: Response) => {
    const { nome, ativo } = req.body;
    const category = await prisma.category.create({
        data: { nome, ativo }
    });
    res.status(201).json(category);
};

export const getCategory = async (_req: Request, res: Response) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
    const category = await prisma.category.findUnique({
        where: { id: req.params.id as string },
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
    } catch {
        return res.status(404).json({ message: "Categoria não encontrada", statusCode: 404, error: "Not Found" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        await prisma.category.delete({
            where: { id: req.params.id as string },
        });
        res.status(204).send();
    } catch {
        return res.status(404).json({ message: "Categoria não encontrada", statusCode: 404, error: "Not Found" });
    }
};
