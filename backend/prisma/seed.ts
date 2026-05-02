import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcrypt";

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Iniciando seed...");

    console.log("Limpando dados existentes...");
    await prisma.refreshToken.deleteMany();
    await prisma.history.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.reimbursement.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // --- CRIA USUÁRIOS ---
    console.log("Criando usuários...");
    const senhaHash = await hash("123456", 10);

    const admin = await prisma.user.create({
        data: { nome: "Administrador", email: "admin@pitang.com", senha: senhaHash, perfil: "ADMIN" },
    });

    const colaborador = await prisma.user.create({
        data: { nome: "Colaborador", email: "colaborador@pitang.com", senha: senhaHash, perfil: "COLABORADOR" },
    });

    const gestor = await prisma.user.create({
        data: { nome: "Gestor", email: "gestor@pitang.com", senha: senhaHash, perfil: "GESTOR" },
    });

    const financeiro = await prisma.user.create({
        data: { nome: "Financeiro", email: "financeiro@pitang.com", senha: senhaHash, perfil: "FINANCEIRO" },
    });

    // --- CRIA CATEGORIAS ---
    console.log("Criando categorias...");
    const alimentacao = await prisma.category.create({
        data: { nome: "Alimentação", valorMaximo: 200 },
    });

    const transporte = await prisma.category.create({
        data: { nome: "Transporte", valorMaximo: 500 },
    });

    const hospedagem = await prisma.category.create({
        data: { nome: "Hospedagem", valorMaximo: 2000 },
    });

    const material = await prisma.category.create({
        data: { nome: "Material de escritório", valorMaximo: 300 },
    });

    const educacao = await prisma.category.create({
        data: { nome: "Educação", valorMaximo: null },
    });

    // --- CRIA SOLICITAÇÕES ---
    console.log("Criando solicitações...");
    const rascunho = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: transporte.id,
            descricao: "Uber para reunião com cliente",
            valor: 80.00,
            dataDespesa: new Date("2026-04-20"),
            status: "RASCUNHO",
        },
    });

    const enviado = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: alimentacao.id,
            descricao: "Almoço com equipe de vendas",
            valor: 150.00,
            dataDespesa: new Date("2026-04-18"),
            status: "ENVIADO",
        },
    });

    const aprovado = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: hospedagem.id,
            descricao: "Hotel para evento em São Paulo",
            valor: 1200.00,
            dataDespesa: new Date("2026-04-10"),
            status: "APROVADO",
        },
    });
}

main()
    .catch((e) => {
        console.error("Erro no seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });