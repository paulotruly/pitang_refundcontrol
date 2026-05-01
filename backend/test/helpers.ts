import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../src/prisma.js";
import { Perfil } from "../generated/prisma/client.js";

// helpers.ts vai servir para ter funções reutilizaveis e preparar dados no banco de teste, sem ter que repetir

const JWT_SECRET = process.env.JWT_SECRET || "123456";

// cria um usuário e retorna o usuário + token JWT
export async function createTestUser(perfil: Perfil = Perfil.COLABORADOR) {
  const senhaHash = await bcrypt.hash("senha123", 10);
  const uniqueId = Date.now() + Math.random().toString(36).substring(2, 9); // sufixo único
  
  const user = await prisma.user.create({
    data: {
      nome: `Teste ${perfil}`,
      email: `teste-${perfil.toLowerCase()}-${uniqueId}@email.com`,
      senha: senhaHash,
      perfil
    }
    });

    const token = jwt.sign(
        { sub: user.id, email: user.email, perfil: user.perfil },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
    return { user, token };
}

// cria uma categoria ativa
export async function createTestCategory() {
  return prisma.category.create({
    data: { nome: "Categoria teste" }
  });
}

// cria um reembolso em status RASCUNHO
export async function createTestReimbursement(solicitanteId: string, categoriaId: string) {
  return prisma.reimbursement.create({
    data: {
      solicitanteId,
      categoriaId,
      descricao: "Reembolso teste",
      valor: 100.50,
      dataDespesa: new Date("2026-05-01"),
      status: "RASCUNHO"
    }
  });
}