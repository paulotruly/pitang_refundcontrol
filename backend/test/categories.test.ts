import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { createTestUser } from "./helpers.js";
import { Perfil } from "../generated/prisma/client.js";

describe("POST /categories", () => {
  let adminToken: string;
  let colabToken: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
  });


  it("ADMIN cria categoria com sucesso (201)", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Nova categoria" });

    expect(res.status).toBe(201);
    expect(res.body.nome).toBe("Nova categoria");
  });


  it("não-ADMIN recebe 403", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${colabToken}`)
      .send({ nome: "Categoria proibida" });
      
    expect(res.status).toBe(403);
  });

});

describe("GET /categories", () => {
  let adminToken: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
  });

  // lista todas as categorias, mesmo vazia - retorna estrutura com dados e paginação
  it("retorna lista de categorias com paginação (200)", async () => {
    const res = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dados");
    expect(res.body).toHaveProperty("paginacao");
    expect(Array.isArray(res.body.dados)).toBe(true);
  });
});

describe("GET /categories/:id", () => {
  let adminToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
    const cat = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Categoria Teste" });
    categoriaId = cat.body.id;
  });

  // busca categoria pelo id e verifica os dados
  it("retorna categoria por ID (200)", async () => {
    const res = await request(app)
      .get(`/categories/${categoriaId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Categoria Teste");
    expect(res.body.id).toBe(categoriaId);
  });

  // id inexistente retorna 404
  it("UUID inexistente retorna 404", async () => {
    const fakeUuid = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .get(`/categories/${fakeUuid}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /categories/:id", () => {
  let adminToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const admin = await createTestUser(Perfil.ADMIN);
    adminToken = admin.token;
    const cat = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Categoria Original" });
    categoriaId = cat.body.id;
  });

  // atualiza nome da categoria
  it("ADMIN atualiza nome da categoria (200)", async () => {
    const res = await request(app)
      .put(`/categories/${categoriaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Categoria Atualizada" });

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Categoria Atualizada");
  });

  // não-ADMIN não pode atualizar categoria
  it("não-ADMIN recebe 403 ao atualizar", async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    const res = await request(app)
      .put(`/categories/${categoriaId}`)
      .set("Authorization", `Bearer ${colab.token}`)
      .send({ nome: "Tentativa" });

    expect(res.status).toBe(403);
  });
});