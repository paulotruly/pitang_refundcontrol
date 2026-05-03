/**
 * TESTES EXPANDIDOS - FUNCIONALIDADES NOVAS
 * 
 * cobre: refresh token, logout, paginacao, filtros,
 * ordenacao, bloqueio data futura, limite por categoria,
 * bloqueio sem anexo, soft delete
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { createTestUser, createTestCategory, createTestReimbursement } from "./helpers.js";
import { prisma } from "../src/prisma.js";
import { Perfil } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";

describe("POST /auth/refresh", () => {
  it("refresh token valido retorna novo par de tokens (200)", async () => {
    const uniqueId = Date.now() + Math.random().toString(36).substring(2, 9);
    const email = `refresh-test-${uniqueId}@email.com`;
    const senhaHash = await bcrypt.hash("senha123", 10);
    await prisma.user.create({ data: { nome: "Teste", email, senha: senhaHash, perfil: "COLABORADOR" } });

    const login = await request(app).post("/auth/login").send({ email, senha: "senha123" });
    expect(login.status).toBe(200);
    const refreshToken = login.body.refreshToken;
    const oldAccessToken = login.body.accessToken;

    const refreshRes = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
    expect(refreshRes.body).toHaveProperty("refreshToken");
    expect(refreshRes.body.refreshToken).not.toBe(refreshToken); // refresh token novo é diferente
  });

  it("refresh token ja usado (revogado) retorna 401", async () => {
    const uniqueId = Date.now() + Math.random().toString(36).substring(2, 9);
    const email = `used-${uniqueId}@email.com`;
    const senhaHash = await bcrypt.hash("senha123", 10);
    await prisma.user.create({ data: { nome: "Teste", email, senha: senhaHash, perfil: "COLABORADOR" } });

    const login = await request(app).post("/auth/login").send({ email, senha: "senha123" });
    const refreshToken = login.body.refreshToken;

    await request(app).post("/auth/refresh").send({ refreshToken });

    const res = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(401);
  });

  it("refresh token inexistente retorna 401", async () => {
    const res = await request(app).post("/auth/refresh").send({ refreshToken: "token-que-nao-existe" });
    expect(res.status).toBe(401);
  });

  it("refresh token sem campo retorna 400", async () => {
    const res = await request(app).post("/auth/refresh").send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/logout", () => {
  it("logout revoga o refresh token (200)", async () => {
    const uniqueId = Date.now() + Math.random().toString(36).substring(2, 9);
    const email = `logout-${uniqueId}@email.com`;
    const senhaHash = await bcrypt.hash("senha123", 10);
    await prisma.user.create({ data: { nome: "Teste", email, senha: senhaHash, perfil: "COLABORADOR" } });

    const login = await request(app).post("/auth/login").send({ email, senha: "senha123" });
    const refreshToken = login.body.refreshToken;

    const res = await request(app).post("/auth/logout").send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logout realizado com sucesso");

    const refreshRes = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

describe("GET /reimbursement - Paginacao", () => {
  let colabToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const cat = await createTestCategory();
    categoriaId = cat.id;
    for (let i = 0; i < 15; i++) {
      await createTestReimbursement(colabId, categoriaId);
    }
  });

  it("retorna estrutura de paginacao com dados", async () => {
    const res = await request(app).get("/reimbursement").set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dados");
    expect(res.body).toHaveProperty("paginacao");
    expect(res.body.paginacao).toHaveProperty("paginaAtual");
    expect(res.body.paginacao).toHaveProperty("limite");
    expect(res.body.paginacao).toHaveProperty("totalItens");
    expect(res.body.paginacao).toHaveProperty("totalPaginas");
  });

  it("padrao retorna 10 itens", async () => {
    const res = await request(app).get("/reimbursement").set("Authorization", `Bearer ${colabToken}`);
    expect(res.body.dados.length).toBe(10);
    expect(res.body.paginacao.totalItens).toBe(15);
    expect(res.body.paginacao.totalPaginas).toBe(2);
  });

  it("?limite=5 retorna 5 itens por pagina", async () => {
    const res = await request(app).get("/reimbursement?limite=5").set("Authorization", `Bearer ${colabToken}`);
    expect(res.body.dados.length).toBe(5);
    expect(res.body.paginacao.limite).toBe(5);
    expect(res.body.paginacao.totalPaginas).toBe(3);
  });

  it("?pagina=2 retorna segunda pagina", async () => {
    const res = await request(app).get("/reimbursement?pagina=2&limite=10").set("Authorization", `Bearer ${colabToken}`);
    expect(res.body.dados.length).toBe(5);
    expect(res.body.paginacao.paginaAtual).toBe(2);
  });
});

describe("GET /reimbursement - Filtro por status", () => {
  let colabToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("?status=RASCUNHO filtra apenas rascunhos", async () => {
    await createTestReimbursement(colabId, categoriaId);
    const enviado = await createTestReimbursement(colabId, categoriaId);
    await prisma.reimbursement.update({ where: { id: enviado.id }, data: { status: "ENVIADO" } });

    const res = await request(app).get("/reimbursement?status=RASCUNHO").set("Authorization", `Bearer ${colabToken}`);
    expect(res.body.dados.every((r: any) => r.status === "RASCUNHO")).toBe(true);
  });
});

describe("GET /reimbursement - filtro por categoria", () => {
  let colabToken: string;
  let colabId: string;
  let cat1Id: string;
  let cat2Id: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const c1 = await createTestCategory();
    const c2 = await createTestCategory();
    cat1Id = c1.id;
    cat2Id = c2.id;
    await prisma.reimbursement.create({ data: { solicitanteId: colabId, categoriaId: cat1Id, descricao: "D1", valor: 50, dataDespesa: new Date("2025-01-01"), status: "RASCUNHO" } });
    await prisma.reimbursement.create({ data: { solicitanteId: colabId, categoriaId: cat2Id, descricao: "D2", valor: 50, dataDespesa: new Date("2025-01-01"), status: "RASCUNHO" } });
  });

  it("?categoria=id filtra por categoria especifica", async () => {
    const res = await request(app).get(`/reimbursement?categoria=${cat1Id}`).set("Authorization", `Bearer ${colabToken}`);
    expect(res.body.dados.length).toBe(1);
    expect(res.body.dados[0].categoriaId).toBe(cat1Id);
  });
});

describe("GET /reimbursement - busca por nome", () => {
  let adminToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
    const senhaHash = await bcrypt.hash("senha123", 10);
    await prisma.user.create({ data: { nome: "Joao Silva", email: "joao@teste.com", senha: senhaHash, perfil: "COLABORADOR" } });
    await prisma.user.create({ data: { nome: "Maria Santos", email: "maria@teste.com", senha: senhaHash, perfil: "COLABORADOR" } });
    const joao = await prisma.user.findUnique({ where: { email: "joao@teste.com" } });
    const maria = await prisma.user.findUnique({ where: { email: "maria@teste.com" } });
    await prisma.reimbursement.create({ data: { solicitanteId: joao!.id, categoriaId, descricao: "Despesa Joao", valor: 50, dataDespesa: new Date("2025-01-01"), status: "RASCUNHO" } });
    await prisma.reimbursement.create({ data: { solicitanteId: maria!.id, categoriaId, descricao: "Despesa Maria", valor: 50, dataDespesa: new Date("2025-01-01"), status: "RASCUNHO" } });
  });

  it("?busca=Joao retorna apenas despesas do Joao", async () => {
    const res = await request(app).get("/reimbursement?busca=Joao").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.dados.every((r: any) => r.solicitante.nome.includes("Joao"))).toBe(true);
  });
});

describe("GET /reimbursement - ordenacao", () => {
  let adminToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
    const colab = await createTestUser(Perfil.COLABORADOR);
    await prisma.reimbursement.create({ data: { solicitanteId: colab.user.id, categoriaId, descricao: "Barato", valor: 50, dataDespesa: new Date("2025-04-10"), status: "RASCUNHO" } });
    await prisma.reimbursement.create({ data: { solicitanteId: colab.user.id, categoriaId, descricao: "Caro", valor: 500, dataDespesa: new Date("2025-04-01"), status: "RASCUNHO" } });
  });

  it("?ordenarPor=valor&ordem=asc ordena do menor para o maior", async () => {
    const res = await request(app).get("/reimbursement?ordenarPor=valor&ordem=asc").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.dados[0].valor).toBeLessThanOrEqual(res.body.dados[1].valor);
  });

  it("?ordenarPor=valor&ordem=desc ordena do maior para o menor", async () => {
    const res = await request(app).get("/reimbursement?ordenarPor=valor&ordem=desc").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.dados[0].valor).toBeGreaterThanOrEqual(res.body.dados[1].valor);
  });
});

describe("POST /reimbursement - bloqueio de data futura", () => {
  let colabToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("data futura retorna 400", async () => {
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);
    const res = await request(app).post("/reimbursement").set("Authorization", `Bearer ${colabToken}`).send({ categoriaId, descricao: "Futuro", valor: 100, dataDespesa: dataFutura.toISOString() });
    expect(res.status).toBe(400);
  });

  it("data passada retorna 201", async () => {
    const res = await request(app).post("/reimbursement").set("Authorization", `Bearer ${colabToken}`).send({ categoriaId, descricao: "Passado", valor: 100, dataDespesa: "2025-01-01" });
    expect(res.status).toBe(201);
  });
});

describe("POST /reimbursement - limite de valor por categoria", () => {
  let colabToken: string;
  let catComLimiteId: string;
  let catSemLimiteId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    const c1 = await createTestCategory(200);
    const c2 = await createTestCategory();
    catComLimiteId = c1.id;
    catSemLimiteId = c2.id;
  });

  it("valor acima do limite retorna 400", async () => {
    const res = await request(app).post("/reimbursement").set("Authorization", `Bearer ${colabToken}`).send({ categoriaId: catComLimiteId, descricao: "Caro", valor: 300, dataDespesa: "2025-01-01" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("excede o limite");
  });

  it("valor dentro do limite retorna 201", async () => {
    const res = await request(app).post("/reimbursement").set("Authorization", `Bearer ${colabToken}`).send({ categoriaId: catComLimiteId, descricao: "Barato", valor: 150, dataDespesa: "2025-01-01" });
    expect(res.status).toBe(201);
  });

  it("categoria sem limite aceita qualquer valor", async () => {
    const res = await request(app).post("/reimbursement").set("Authorization", `Bearer ${colabToken}`).send({ categoriaId: catSemLimiteId, descricao: "Sem limite", valor: 99999, dataDespesa: "2025-01-01" });
    expect(res.status).toBe(201);
  });
});

describe("POST /reimbursement/:id/submit - boqueio sem anexo", () => {
  let colabToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("acima de R$100 sem anexo retorna 400", async () => {
    const reembolso = await prisma.reimbursement.create({ data: { solicitanteId: colabId, categoriaId, descricao: "Caro", valor: 200, dataDespesa: new Date("2025-01-01"), status: "RASCUNHO" } });
    const res = await request(app).post(`/reimbursement/${reembolso.id}/submit`).set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("exigem comprovante");
  });

  it("acima de R$100 COM anexo retorna 200", async () => {
    const reembolso = await prisma.reimbursement.create({ data: { solicitanteId: colabId, categoriaId, descricao: "Caro c/ anexo", valor: 200, dataDespesa: new Date("2025-01-01"), status: "RASCUNHO" } });
    await prisma.attachment.create({ data: { solicitacaoId: reembolso.id, nomeArquivo: "comp.pdf", urlArquivo: "/uploads/comp.pdf", tipoArquivo: "application/pdf" } });
    const res = await request(app).post(`/reimbursement/${reembolso.id}/submit`).set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ENVIADO");
  });

  it("abaixo de R$100 sem anexo retorna 200", async () => {
    const reembolso = await prisma.reimbursement.create({ data: { solicitanteId: colabId, categoriaId, descricao: "Barato", valor: 50, dataDespesa: new Date("2025-01-01"), status: "RASCUNHO" } });
    const res = await request(app).post(`/reimbursement/${reembolso.id}/submit`).set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(200);
  });
});

describe("DELETE /category/:id - Soft delete", () => {
  let adminToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("deleta categoria (soft delete) retorna 200", async () => {
    const res = await request(app).delete(`/category/${categoriaId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categoria deletada com sucesso");
    const cat = await prisma.category.findUnique({ where: { id: categoriaId } });
    expect(cat).not.toBeNull();
    expect(cat!.deletadoEm).not.toBeNull();
  });

  it("categoria deletada nao aparece na listagem", async () => {
    await request(app).delete(`/category/${categoriaId}`).set("Authorization", `Bearer ${adminToken}`);
    const res = await request(app).get("/category").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.find((c: any) => c.id === categoriaId)).toBeUndefined();
  });

  it("nao e possivel criar solicitação com categoria deletada", async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    await request(app).delete(`/category/${categoriaId}`).set("Authorization", `Bearer ${adminToken}`);
    const res = await request(app).post("/reimbursement").set("Authorization", `Bearer ${colab.token}`).send({ categoriaId, descricao: "Teste", valor: 50, dataDespesa: "2025-01-01" });
    expect(res.status).toBe(400);
  });

  it("deletar categoria ja deletada retorna 404", async () => {
    await request(app).delete(`/category/${categoriaId}`).set("Authorization", `Bearer ${adminToken}`);
    const res = await request(app).delete(`/category/${categoriaId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

describe("soft delete - reimbursement", () => {
  let adminToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabId = colab.user.id;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("solicitacao deletada nao aparece na listagem", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    await prisma.reimbursement.update({ where: { id: reembolso.id }, data: { deletadoEm: new Date() } });
    const res = await request(app).get("/reimbursement").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.dados.find((r: any) => r.id === reembolso.id)).toBeUndefined();
  });

  it("nao e possivel acessar solicitacao deletada por ID", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    await prisma.reimbursement.update({ where: { id: reembolso.id }, data: { deletadoEm: new Date() } });
    const res = await request(app).get(`/reimbursement/${reembolso.id}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
