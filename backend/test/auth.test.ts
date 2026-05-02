import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import bcrypt from "bcrypt";

describe("POST /auth/login", () => {
  // limpa usuários antes de cada teste - pra que?
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("credenciais válidas retornam token (200)", async () => {
    // 1 - cria usuário no banco de teste
    const senhaHash = await bcrypt.hash("senha123", 10);
    await prisma.user.create({
      data: {
        nome: "Usuário",
        email: "login@email.com",
        senha: senhaHash,
        perfil: "COLABORADOR"
      }
    });

    // 2 - faz requisição de login
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@email.com", senha: "senha123" });
    
      // 3 - validações com o expect()
    expect(res.status).toBe(200); // espera um 200 OK
    expect(res.body).toHaveProperty("accessToken"); // verifica se retornou token
    expect(res.body).toHaveProperty("refreshToken");
    expect(typeof res.body.accessToken).toBe("string"); // token é string
    expect(typeof res.body.refreshToken).toBe("string"); 
  });

  it("credenciais inválidas retornam 401", async () => {
    const senhaHash = await bcrypt.hash("senha123", 10);
    await prisma.user.create({
      data: {
        nome: "Usuário Login",
        email: "login@email.com",
        senha: senhaHash,
        perfil: "COLABORADOR"
      }
    });

    // tenta login com senha errada
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@email.com", senha: "senha-errada" });
    
      expect(res.status).toBe(401); // espera um 401 Unauthorized
  });


  it("rota protegida sem token retorna 401", async () => {
    // tenta acessar rota protegida sem authorization header
    const res = await request(app).get("/users");
    expect(res.status).toBe(401); // espera um 401 Unauthorized
  });


});