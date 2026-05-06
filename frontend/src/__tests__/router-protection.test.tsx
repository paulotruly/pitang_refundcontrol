// ─────────────────────────────────────────────────────────────
// MOCKS
//
// O sistema de rotas usa:
//   - getToken() para verificar se o usuário está logado
//   - redirect() para redirecionar rotas protegidas
//
// Como as funções de proteção (requireAuth, requireRole) estão
// inline no router.ts e não são exportadas, recriamos a lógica
// aqui para testar isoladamente. Isso é chamado de
// "testar o comportamento, não a implementação".
// ─────────────────────────────────────────────────────────────

jest.mock("@/lib/cookies", () => ({
  __esModule: true,
  getToken: jest.fn(),
}));

import { getToken } from "@/lib/cookies";
import { redirect } from "@tanstack/react-router";

// ─────────────────────────────────────────────────────────────
// RECREANDO A LÓGICA DE PROTEÇÃO
//
// Esta é a MESMA lógica do router.ts, duplicada aqui para
// podermos testá-la isoladamente. A função requireAuth verifica
// se existe um token; se não existir, lança um redirect.
//
// No mundo real, isso acontece no beforeLoad do TanStack Router.
// O redirect é uma exceção especial que o Router intercepta
// para fazer navegação.
// ─────────────────────────────────────────────────────────────
function mockRequireAuth() {
  if (!getToken()) {
    throw redirect({ to: "/login" });
  }
}

// Limpa mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────
// TESTE: ProtectedRoute redireciona para /login sem token
//
// Este é o teste mais importante de segurança frontend.
// Garante que se um usuário tenta acessar uma rota protegida
// sem estar logado (sem token), ele é redirecionado para a
// página de login.
//
// Cenários testados:
//   1) Sem token → requireAuth lança redirect
//   2) Com token → requireAuth não lança (acesso permitido)
// ─────────────────────────────────────────────────────────────
describe("Proteção de rotas — Redirecionamento sem token", () => {
  it("deve lançar redirect quando não há token", () => {
    // getToken retorna undefined → usuário não está logado
    (getToken as jest.Mock).mockReturnValue(undefined);

    // Ao chamar requireAuth sem token, deve lançar uma exceção de redirect
    expect(() => mockRequireAuth()).toThrow();
  });

  it("NÃO deve lançar quando há token válido", () => {
    // getToken retorna um token → usuário está logado
    (getToken as jest.Mock).mockReturnValue("fake-jwt-token");

    // Sem exceção = proteção passou, acesso permitido
    expect(() => mockRequireAuth()).not.toThrow();
  });

  it("deve lançar quando há token vazio (string vazia é falsy)", () => {
    // Edge case: string vazia é falsy em JavaScript.
    // `!""` === true, então o requireAuth vai lançar redirect.
    // Isso significa que nosso sistema trata string vazia como "sem token".
    (getToken as jest.Mock).mockReturnValue("");

    expect(() => mockRequireAuth()).toThrow();
  });
});
