import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { createTestUser, createTestCategory, createTestReimbursement } from "./helpers.js";
import { Perfil } from "../generated/prisma/client.js";

describe("POST /reimbursement", () => {
  let colabToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });


  it("COLABORADOR cria solicitação com sucesso (201)", async () => {
    const res = await request(app)
      .post("/reimbursement")
      .set("Authorization", `Bearer ${colabToken}`)
      .send({
        categoriaId,
        descricao: "Compra de materiais",
        valor: 150.75,
        dataDespesa: "2025-05-01"
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("RASCUNHO");
  });


  it("valor <= 0 retorna 400", async () => {
    const res = await request(app)
      .post("/reimbursement")
      .set("Authorization", `Bearer ${colabToken}`)
      .send({
        categoriaId,
        descricao: "Valor inválido",
        valor: 0,
        dataDespesa: "2025-05-01"
      });
    expect(res.status).toBe(400);
  });


  it("categoria inexistente retorna 400", async () => {
    const res = await request(app)
      .post("/reimbursement")
      .set("Authorization", `Bearer ${colabToken}`)
      .send({
        categoriaId: "id-inexistente",
        descricao: "Categoria inválida",
        valor: 100,
        dataDespesa: "2025-05-01"
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /reimbursement/:id/submit", () => {
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

  it("transição RASCUNHO -> ENVIADO (200)", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    const res = await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ENVIADO");
  });
});

describe("POST /reimbursement/:id/approve", () => {
  let gestorToken: string;
  let gestorId: string;
  let colabToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const gestor = await createTestUser(Perfil.GESTOR);
    gestorToken = gestor.token;
    gestorId = gestor.user.id;
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("GESTOR aprova solicitação ENVIADA (200)", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);

      const res = await request(app)
      .post(`/reimbursement/${reembolso.id}/approve`)
      .set("Authorization", `Bearer ${gestorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("APROVADO");
  });


  it("COLABORADOR recebe 403 ao tentar aprovar", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
    const res = await request(app)
      .post(`/reimbursement/${reembolso.id}/approve`)
      .set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(403);
  });
});

describe("POST /reimbursement/:id/reject", () => {
  let gestorToken: string;
  let colabToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const gestor = await createTestUser(Perfil.GESTOR);
    gestorToken = gestor.token;
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("rejeição com justificativa retorna 200", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
      
      const res = await request(app)
      
      .post(`/reimbursement/${reembolso.id}/reject`)
      .set("Authorization", `Bearer ${gestorToken}`)
      .send({ justificativaRejeicao: "Despesa não autorizada" });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("REJEITADO");
  });

  it("rejeição sem justificativa retorna 400", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
    const res = await request(app)
      .post(`/reimbursement/${reembolso.id}/reject`)
      .set("Authorization", `Bearer ${gestorToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /reimbursement/:id/pay", () => {
  let financeiroToken: string;
  let gestorToken: string;
  let colabToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const financeiro = await createTestUser(Perfil.FINANCEIRO);
    financeiroToken = financeiro.token;
    const gestor = await createTestUser(Perfil.GESTOR);
    gestorToken = gestor.token;
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("FINANCEIRO marca como pago (200)", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
    
    await request(app)
      .post(`/reimbursement/${reembolso.id}/approve`)
      .set("Authorization", `Bearer ${gestorToken}`);
    
      const res = await request(app)

      .post(`/reimbursement/${reembolso.id}/pay`)
      .set("Authorization", `Bearer ${financeiroToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("PAGO");
  });

  it("GESTOR recebe 403 ao tentar pagar", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
    await request(app)
      .post(`/reimbursement/${reembolso.id}/approve`)
      .set("Authorization", `Bearer ${gestorToken}`);
    const res = await request(app)
      .post(`/reimbursement/${reembolso.id}/pay`)
      .set("Authorization", `Bearer ${gestorToken}`);
    
      expect(res.status).toBe(403);
  });
});

describe("Transições inválidas", () => {
  let financeiroToken: string;
  let colabToken: string;
  let colabId: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const financeiro = await createTestUser(Perfil.FINANCEIRO);
    financeiroToken = financeiro.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("pagar solicitação ENVIADA retorna 401", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
    const res = await request(app)
      .post(`/reimbursement/${reembolso.id}/pay`)
      .set("Authorization", `Bearer ${financeiroToken}`);
    expect(res.status).toBe(400);
  });
});

describe("GET /reimbursement", () => {
  let colabToken: string;
  let colabId: string;
  let outroColabToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const outroColab = await createTestUser(Perfil.COLABORADOR);
    outroColabToken = outroColab.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("COLABORADOR vê apenas as suas solicitações", async () => {
    await createTestReimbursement(colabId, categoriaId);
    const res = await request(app)
      .get("/reimbursement")
      .set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(200);
    expect(res.body.dados.length).toBe(1); // apenas o dele
    expect(res.body.dados[0].solicitanteId).toBe(colabId); // apenas o próprio id
  });
});

describe("GET /reimbursement/:id/history", () => {
  let colabToken: string;
  let colabId: string;
  let gestorToken: string;
  let categoriaId: string;

  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
    colabId = colab.user.id;
    const gestor = await createTestUser(Perfil.GESTOR);
    gestorToken = gestor.token;
    const cat = await createTestCategory();
    categoriaId = cat.id;
  });

  it("retorna histórico após ações", async () => {
    const reembolso = await createTestReimbursement(colabId, categoriaId);
    
    await request(app)
      .post(`/reimbursement/${reembolso.id}/submit`)
      .set("Authorization", `Bearer ${colabToken}`);
    
      await request(app)
      .post(`/reimbursement/${reembolso.id}/approve`)
      .set("Authorization", `Bearer ${gestorToken}`);
    
      const res = await request(app)
      .get(`/reimbursement/${reembolso.id}/history`)
      .set("Authorization", `Bearer ${colabToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // deve ter histórico de criação, envio, aprovação
  });
});