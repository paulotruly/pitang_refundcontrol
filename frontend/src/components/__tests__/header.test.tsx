import { render, screen } from "@testing-library/react";
import Header from "../header";
import { useAuth } from "@/context/AuthContext";

// --------------------- MOCKS ---------------------

// mock do contexto de autenticação para controlar o perfil do usuário nos testes
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// mock do tanstack router para evitar erros de navegação
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => jest.fn(),
}));

// helper de tipagem para o mock do useAuth
const mockUseAuth = useAuth as jest.Mock;

// função auxiliar para configurar o mock do useAuth com dados específicos
function setupAuth(overrides: Partial<{ user: { nome: string; perfil: string } | null; logout: jest.Mock }>) {
  mockUseAuth.mockReturnValue({
    user: null,
    logout: jest.fn(),
    ...overrides,
  });
}

// limpa mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
});

// --------------------- TESTES ---------------------

describe("Header - renderização por perfil", () => {
  // quando não há usuário logado, o header deve mostrar informações padrão
  it("deve mostrar 'Usuario' e 'Perfil' quando não há usuário", () => {
    setupAuth({ user: null });
    render(<Header />);

    expect(screen.getByText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByText(/perfil/i)).toBeInTheDocument();
  });

  // para ADMIN, o botão de navegação "categorias" deve aparecer
  it("deve mostrar link de categorias para ADMIN", () => {
    setupAuth({
      user: { nome: "Admin", perfil: "ADMIN" },
    });
    render(<Header />);

    expect(screen.getByText(/categorias/i)).toBeInTheDocument();
  });

  // para COLABORADOR, o botão "categorias" NÃO deve aparecer
  it("NÃO deve mostrar link de categorias para COLABORADOR", () => {
    setupAuth({
      user: { nome: "João", perfil: "COLABORADOR" },
    });
    render(<Header />);

    expect(screen.queryByText(/categorias/i)).not.toBeInTheDocument();
  });

  // para GESTOR, o botão "categorias" NÃO deve aparecer
  it("NÃO deve mostrar link de categorias para GESTOR", () => {
    setupAuth({
      user: { nome: "Maria", perfil: "GESTOR" },
    });
    render(<Header />);

    expect(screen.queryByText(/categorias/i)).not.toBeInTheDocument();
  });

  // para FINANCEIRO, o botão "categorias" NÃO deve aparecer
  it("NÃO deve mostrar link de categorias para FINANCEIRO", () => {
    setupAuth({
      user: { nome: "Carlos", perfil: "FINANCEIRO" },
    });
    render(<Header />);

    expect(screen.queryByText(/categorias/i)).not.toBeInTheDocument();
  });

  // verifica se o nome do usuário é exibido corretamente
  it("deve exibir o nome do usuário logado", () => {
    setupAuth({
      user: { nome: "João Silva", perfil: "COLABORADOR" },
    });
    render(<Header />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  // verifica se o perfil do usuário é exibido corretamente
  it("deve exibir o perfil do usuário logado", () => {
    setupAuth({
      user: { nome: "Maria", perfil: "GESTOR" },
    });
    render(<Header />);

    expect(screen.getByText("GESTOR")).toBeInTheDocument();
  });

  // o botão de sair deve estar sempre presente quando há usuário
  it("deve mostrar botão de sair quando usuário está logado", () => {
    setupAuth({
      user: { nome: "João", perfil: "COLABORADOR" },
    });
    render(<Header />);

    expect(screen.getByText(/sair/i)).toBeInTheDocument();
  });
});
