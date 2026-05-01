import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { createTestUser } from "./helpers.js";
import { Perfil } from "../generated/prisma/client.js";

const UUID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("Recursos inexistentes", () => {
  let colabToken: string;
  
  beforeEach(async () => {
    const colab = await createTestUser(Perfil.COLABORADOR);
    colabToken = colab.token;
  });

  it("GET /users/:id inexistente retorna 404", async () => {
    const res = await request(app)
      .get(`/users/${UUID_INEXISTENTE}`)
      .set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(404);
  });


  it("GET /reimbursement/:id inexistente retorna 404", async () => {
    const res = await request(app)
      .get(`/reimbursement/${UUID_INEXISTENTE}`)
      .set("Authorization", `Bearer ${colabToken}`);
    expect(res.status).toBe(404);
  });

});