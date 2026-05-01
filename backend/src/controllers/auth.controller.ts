import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const SECRET = process.env.JWT_SECRET || "secret"; // essa variável de ambiente é usada para assinar os tokens JWT,
// garantindo que eles sejam seguros e não possam ser facilmente falsificados. 

// basicamente, o registro é responsável por criar um novo usuário, criptografar a senha usando bcrypt e gerar um token JWT para o usuário recém-registrado
export const register = async (req: Request, res: Response) => {
    const { nome, email, senha } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } }); // verifica se já existe um usuário com o mesmo email no banco de dados usando prisma

    if (existingUser) {
        return res.status(400).json({ error: 'Email já está sendo usado!' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10); // fazendo a senha ser criptografada com o bcrypt pegando o password do body e criptografando ele com 10 rounds de salt,
    // esse salt é um valor aleatório que é adicionado à senha antes de ser criptografada, isso ajuda a proteger contra ataques de força bruta

    const newUser = await prisma.user.create({
        data: { nome, email, senha: hashedPassword, perfil: "COLABORADOR" }
    }); // cria o novo usuário no banco de dados usando prisma

    const token = jwt.sign({sub: newUser.id, email: newUser.email, perfil: newUser.perfil}, SECRET, { expiresIn: '1h'}); // gerando um token JWT para o usuário recém-registrado,
    // o token inclui o ID e email do usuário e tem uma expiração de 1 hora

    const { senha: _, ...userWithoutPassword } = newUser; // retirando a senha do objeto de usuário para não enviar ela na resposta
    res.status(201).json({ token, user: userWithoutPassword });
}

export const login = async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    const user = await prisma.user.findUnique({ where: { email } }); // verifica se existe um usuário com o email fornecido usando prisma

    if (!user) {
        return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const isValid = await bcrypt.compare(senha, user.senha); // verifica se a senha fornecida pelo usuário corresponde à
    // senha armazenada (que está criptografada) usando bcrypt.compare
    if (!isValid) {
        return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({sub: user.id, email: user.email, perfil: user.perfil}, SECRET, { expiresIn: '1h'}); // se a senha for válida, gera um token JWT para o usuário

    const { senha: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword }); // envia o token e os dados do usuário (sem a senha) na resposta
}