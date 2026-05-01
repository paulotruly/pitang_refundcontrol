import { beforeAll, beforeEach, afterAll } from '@jest/globals';
import { execSync } from "child_process";
import { prisma } from "../src/prisma.js";
import dotenv from "dotenv";

// em suma, o 'setup' prepara o ambiente de teste que roda antes de todos os testes que serão executados

dotenv.config();
process.env.DATABASE_URL = "file::memory:?cache=shared"; // banco em memória para testes

// cria tabelas no banco de teste antes de todos os testes
beforeAll(() => {
  execSync("npx prisma db push --force", {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
});

// limpa todas as tabelas antes de cada teste (isolamento)
beforeEach(async () => {
  await prisma.history.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.reimbursement.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

// desconecta do banco após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});