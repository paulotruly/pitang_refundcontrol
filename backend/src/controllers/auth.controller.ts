import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const SECRET = process.env.JWT_SECRET || "secret";

export const register = async (req: Request, res: Response) => {
    const { nome, email, senha } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso", statusCode: 400, error: "Bad Request" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
        data: { nome, email, senha: hashedPassword, perfil: "COLABORADOR" }
    });

    const token = jwt.sign({ sub: newUser.id, email: newUser.email, perfil: newUser.perfil }, SECRET, { expiresIn: '1h' });

    const { senha: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ token, user: userWithoutPassword });
}

export const login = async (req: Request, res: Response) => {
    try{
        const { email, senha } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas", statusCode: 401, error: "Unauthorized"});
        }

        const isValid = await bcrypt.compare(senha, user.senha);
        if (!isValid) {
            return res.status(401).json({ message: "Credenciais inválidas", statusCode: 401, error: "Unauthorized" });
        }

        const token = jwt.sign({ sub: user.id, email: user.email, perfil: user.perfil }, SECRET, { expiresIn: '1h' });

        const { senha: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        throw error;
    }
}
