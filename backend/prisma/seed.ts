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

    const solicitacao4 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: material.id,
            descricao: "Compra de materiais de escritório",
            valor: 200.00,
            dataDespesa: new Date("2026-04-09"),
            status: "APROVADO",
        },
    });

    const solicitacao5 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: educacao.id,
            descricao: "Curso de React",
            valor: 350.00,
            dataDespesa: new Date("2026-04-08"),
            status: "ENVIADO",
        },
    });

    const solicitacao6 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: transporte.id,
            descricao: "Taxi aeroporto",
            valor: 120.00,
            dataDespesa: new Date("2026-04-07"),
            status: "APROVADO",
        },
    });

    const solicitacao7 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: alimentacao.id,
            descricao: "Jantar com cliente",
            valor: 180.00,
            dataDespesa: new Date("2026-04-06"),
            status: "REJEITADO",
        },
    });

    const solicitacao8 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: hospedagem.id,
            descricao: "Hotel viagem de negócios",
            valor: 950.00,
            dataDespesa: new Date("2026-04-05"),
            status: "APROVADO",
        },
    });

    const solicitacao9 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: material.id,
            descricao: "Compra de teclado e mouse",
            valor: 250.00,
            dataDespesa: new Date("2026-04-04"),
            status: "ENVIADO",
        },
    });

    const solicitacao10 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: transporte.id,
            descricao: "Passagem de ônibus",
            valor: 60.00,
            dataDespesa: new Date("2026-04-03"),
            status: "APROVADO",
        },
    });

    const solicitacao11 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: alimentacao.id,
            descricao: "Café com equipe",
            valor: 50.00,
            dataDespesa: new Date("2026-04-02"),
            status: "RASCUNHO",
        },
    });

    const solicitacao12 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: hospedagem.id,
            descricao: "Hospedagem em Recife",
            valor: 800.00,
            dataDespesa: new Date("2026-04-01"),
            status: "ENVIADO",
        },
    });

    const solicitacao13 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: educacao.id,
            descricao: "Compra de livro técnico",
            valor: 120.00,
            dataDespesa: new Date("2026-03-30"),
            status: "APROVADO",
        },
    });

    const solicitacao14 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: material.id,
            descricao: "Canetas e papel",
            valor: 70.00,
            dataDespesa: new Date("2026-03-29"),
            status: "APROVADO",
        },
    });

    const solicitacao15 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: transporte.id,
            descricao: "Uber noturno",
            valor: 90.00,
            dataDespesa: new Date("2026-03-28"),
            status: "REJEITADO",
        },
    });

    const solicitacao16 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: alimentacao.id,
            descricao: "Almoço diretoria",
            valor: 200.00,
            dataDespesa: new Date("2026-03-27"),
            status: "APROVADO",
        },
    });

    const solicitacao17 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: educacao.id,
            descricao: "Curso AWS",
            valor: 800.00,
            dataDespesa: new Date("2026-03-26"),
            status: "ENVIADO",
        },
    });

    const solicitacao18 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: hospedagem.id,
            descricao: "Hotel congresso",
            valor: 1800.00,
            dataDespesa: new Date("2026-03-25"),
            status: "APROVADO",
        },
    });

    const solicitacao19 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: material.id,
            descricao: "Compra de monitor",
            valor: 900.00,
            dataDespesa: new Date("2026-03-24"),
            status: "ENVIADO",
        },
    });

    const solicitacao20 = await prisma.reimbursement.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: transporte.id,
            descricao: "Corrida 99",
            valor: 55.00,
            dataDespesa: new Date("2026-03-23"),
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