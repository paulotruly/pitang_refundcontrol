import { getToken } from "@/lib/cookies";
import { redirect } from "@tanstack/react-router";

// mocka o módulo de cookies para controlar o retorno de getToken
jest.mock("@/lib/cookies", () => ({
  __esModule: true,
  getToken: jest.fn(),
}));

// função de proteção de rota que será testada
function mockRequireAuth() {
  if (!getToken()) {
    throw redirect({ to: "/login" });
  }
}

// limpa mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
});

describe("proteção de rotas - redirecionamento sem token", () => {
  it("deve lançar redirect quando não há token", () => {
    (getToken as jest.Mock).mockReturnValue(undefined); // simula ausência de token
    expect(() => mockRequireAuth()).toThrow(); // espera que a função lance uma exceção (redirect) quando não há token
  });

  it("NÃO deve lançar quando há token válido", () => {
    (getToken as jest.Mock).mockReturnValue("fake-jwt-token"); // simula presença de token válido
    expect(() => mockRequireAuth()).not.toThrow(); // espera que a função NÃO lance uma exceção quando há token
  });

  it("deve lançar quando há token vazio (string vazia é falsy)", () => {
    (getToken as jest.Mock).mockReturnValue(""); // simula presença de token vazio
    expect(() => mockRequireAuth()).toThrow(); // espera que a função lance uma exceção (redirect) quando o token é vazio
  });
});
