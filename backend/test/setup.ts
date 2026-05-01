import { beforeEach, afterAll } from '@jest/globals';
import { execSync } from "child_process";
import { prisma } from "../src/prisma.js";
import dotenv from "dotenv";

// em suma, o 'setup' prepara o ambiente de teste que roda antes de todos os testes que serão executados
dotenv.config();

// roda prisma db push apenas uma vez
if (!process.env.TEST_DB_INITIALIZED) {
  execSync(`npx prisma db push --url "${process.env.DATABASE_URL}" --force-reset`, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL}
  });
  process.env.TEST_DB_INITIALIZED = "true";
}

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