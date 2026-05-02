import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";

// pra facilitar a criação de tokens
function generateTokens(user: any) {
    const accessToken = jwt.sign(
        { sub: user.id, email: user.email, perfil: user.perfil },
        SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { sub: user.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
}

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

    const { accessToken, refreshToken } = generateTokens(newUser);
    await prisma.refreshToken.create({ // salva o refresh token no banco
        data: {
            token: refreshToken,
            usuarioId: newUser.id,
            expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
    });

    const { senha: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ accessToken, refreshToken, user: userWithoutPassword });
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

        const { accessToken, refreshToken } = generateTokens(user);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                usuarioId: user.id,
                expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });

        const { senha: _, ...userWithoutPassword } = user;
        res.json({ accessToken, refreshToken, user: userWithoutPassword });
    } catch (error) {
        throw error;
    }
}

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // verifica se o refresh token existe no banco e está ativo
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { usuario: true },
    });

    if (!storedToken || storedToken.revogado || storedToken.expiraEm < new Date()) {
        return res.status(401).json({ message: "Refresh token inválido ou expirado", statusCode: 401 });
    }

    // revoga o token antigo (single-use = mais seguro)
    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revogado: true },
    });

    // gera novo par de tokens
    const newAccessToken = jwt.sign(
        { sub: storedToken.usuario.id, email: storedToken.usuario.email, perfil: storedToken.usuario.perfil },
        SECRET,
        { expiresIn: '15m' }
    );
    const newRefreshToken = jwt.sign({ sub: storedToken.usuario.id }, SECRET, { expiresIn: '7d' });

    // salva novo refresh token no banco
    await prisma.refreshToken.create({
        data: {
            token: newRefreshToken,
            usuarioId: storedToken.usuario.id,
            expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // revoga o token específico
    await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revogado: true },
    });
    res.json({ message: "Logout realizado com sucesso" });
};