import type { Request, Response } from "express";
import { hash } from "bcrypt";
import { prisma } from "../prisma.js"

export const createUser = async (req: Request, res: Response) => {
    const { nome, email, senha, perfil } = req.body;
    const hashedPassword = await hash(senha, 10);
    const user = await prisma.user.create({
        data: { nome, email, senha: hashedPassword, perfil },
        omit: { senha: true },
    });
    res.status(201).json(user);
};

export const getUsers = async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany({ omit: { senha: true } });
    res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id as string },
        omit: { senha: true },
    });
    if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado", statusCode: 404, error: "Not Found" });
    }
    res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
    const { nome, email, senha } = req.body;
    const data: { nome?: string; email?: string; senha?: string } = { nome, email };
    if (senha) {
        data.senha = await hash(senha, 10);
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id as string },
            data,
            omit: { senha: true },
        });
        res.json(updatedUser);
    } catch (err: any) {
        if (err.code === "P2025") {
            return res.status(404).json({ message: "Usuário não encontrado", statusCode: 404, error: "Not Found" });
        }
        throw err;
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id as string },
        });
        res.status(204).send();
    } catch (err: any) {
        if (err.code === "P2025") {
            return res.status(404).json({ message: "Usuário não encontrado", statusCode: 404, error: "Not Found" });
        }
        throw err;
    }
};
