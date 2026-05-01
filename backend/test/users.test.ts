import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { Perfil } from "../src/prisma.js";
import { createTestUser } from "./helpers.js";

describe("POST /users", () => {
  let adminToken: string;

  // criando um admin pra autenticar as requisições
  beforeEach(async () => {
    const { token } = await createTestUser(Perfil.ADMIN);
    adminToken = token;
  })

  it("ADMIN cria usuário com dados válidos (201)", async () => {
    const res = await request(app)
      .post("/users") // define o método e a rota
      .set("Authorization", `Bearer ${adminToken}`) // envia o token
      .send({ // envia o body
        nome: "Novo usuário",
        email: "novo@email.com",
        senha: "senha123",
        perfil: "COLABORADOR"
      });
    
    expect(res.status).toBe(201); // espera a resposta 201 OK
    expect(res.body.email).toBe("novo@email.com"); // espera que o email enviado permaneça o mesmo
  });

  it("email duplicado retorna erro (400)", async () => {
    // cria primeiro usuário
    await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Usuário 1",
        email: "duplicado@email.com",
        senha: "senha123",
        perfil: "COLABORADOR"
      });

    // tenta criar com mesmo email
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Usuário 2",
        email: "duplicado@email.com",
        senha: "senha123",
        perfil: "COLABORADOR"
      });

    expect(res.status).toBe(400); // espera um 400 Bad
  });
});