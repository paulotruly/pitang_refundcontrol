import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { createTestUser } from "./helpers.js";
import { Perfil } from "../generated/prisma/client.js";

describe("POST /category", () => {
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
      .post("/category")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Nova categoria" });

    expect(res.status).toBe(201);
    expect(res.body.nome).toBe("Nova categoria");
  });


  it("não-ADMIN recebe 403", async () => {
    const res = await request(app)
      .post("/category")
      .set("Authorization", `Bearer ${colabToken}`)
      .send({ nome: "Categoria proibida" });
      
    expect(res.status).toBe(403);
  });

});