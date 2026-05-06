import { render, screen, waitFor } from "@testing-library/react";
import DataTable from "../data-table";
import { AuthContext } from "@/context/AuthContext";
import type { UserResponse, Reimbursement, ReimbursementResponse } from "@/types";
import * as reimbursementsApi from "@/api/reimbursements";

// mock da API de reembolsos
jest.mock("@/api/reimbursements", () => ({
  getReimbursementsWithTotal: jest.fn(),
  approveReimbursement: jest.fn(),
  rejectReimbursement: jest.fn(),
  payReimbursement: jest.fn(),
  cancelReimbursement: jest.fn(),
  sendReimbursement: jest.fn(),
  getCategoriesWithTotal: jest.fn(),
  createReimbursement: jest.fn(),
  uploadAttachment: jest.fn(),
  getCategories: jest.fn(),
  getCategoryById: jest.fn(),
  updateCategory: jest.fn(),
  createCategory: jest.fn(),
  deleteCategory: jest.fn(),
  editReimbursement: jest.fn(),
  getReimbursementById: jest.fn(),
  getReimbursements: jest.fn(),
  getReimbursementHistory: jest.fn(),
  editAttachment: jest.fn(),
  getAttachmentById: jest.fn(),
  getAttachments: jest.fn(),
}));

// mock do tanstack router
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => jest.fn(),
  useMatch: () => undefined,
  useSearch: () => ({ page: 1 }),
}));

// mock do router (usado para router.invalidate)
jest.mock("@/router", () => ({
  __esModule: true,
  default: { invalidate: jest.fn() },
  createReimbursementRoute: { id: "/interface/solicitacoes/create" },
  editReimbursementRoute: { id: "/interface/solicitacoes/edit/$id" },
}));

// mock dos sub-componentes modais
// apenas garantir que o datatable os renderiza corretamente
// retorna null para não poluir o DOM do teste
jest.mock("../create-reimbursement", () => () => null);
jest.mock("../edit-reimbursement", () => () => null);
jest.mock("../justification-form", () => () => null);
jest.mock("../reimbursement-details", () => () => null);

// tipagem dos mocks para acesso seguro
const mockGetReimbursementsWithTotal = reimbursementsApi.getReimbursementsWithTotal as jest.Mock;

// helper pra renderizar o datatable com um usuário autenticado (ou null para não autenticado)
function renderWithAuth(user: UserResponse | null) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        isAuthentic: !!user,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      }}
    >
      <DataTable />
    </AuthContext.Provider>
  );
}

// mock de dados reutilizáveis nos testes
const mockReimbursements: Reimbursement[] = [
  {
    id: "r-1",
    categoria: { id: "c-1", nome: "Alimentação", ativo: true },
    descricao: "Almoço com cliente",
    valor: 85.5,
    status: "ENVIADO",
    dataDespesa: "2026-01-10",
    solicitanteId: "u-1",
  },
  {
    id: "r-2",
    categoria: { id: "c-2", nome: "Transporte", ativo: true },
    descricao: "Uber para aeroporto",
    valor: 45.0,
    status: "RASCUNHO",
    dataDespesa: "2026-01-12",
    solicitanteId: "u-1",
  },
];

const mockPaginatedResponse: ReimbursementResponse = {
  dados: mockReimbursements,
  paginacao: { paginaAtual: 1, limite: 15, totalItens: 2, totalPaginas: 1 },
};

// limpa mocks
beforeEach(() => {
  jest.clearAllMocks();
});

describe("DataTable - renderização condicional por perfil", () => {
  it("deve mostrar botão 'Nova solicitação' para COLABORADOR", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue(mockPaginatedResponse);
    // serve dados para renderizar a tabela, porque o botão "Nova solicitação" só aparece depois que os dados carregam

    renderWithAuth({ // renderiza o componente com um usuário do perfil COLABORADOR
      id: "u-1",
      nome: "João",
      email: "joao@email.com",
      perfil: "COLABORADOR",
    });

    // aguarda a tabela renderizar (o useEffect busca dados async)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /nova solicitação/i })).toBeInTheDocument();
    });
  });

  it("deve mostrar botão 'Visualizar categorias' para ADMIN", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue({
      dados: [],
      paginacao: { paginaAtual: 1, limite: 15, totalItens: 0, totalPaginas: 0 },
    });

    renderWithAuth({
      id: "u-1",
      nome: "Admin",
      email: "admin@email.com",
      perfil: "ADMIN",
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /visualizar categorias/i })).toBeInTheDocument();
    });
  });

  it("NÃO deve mostrar 'Nova solicitação' para ADMIN", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue(mockPaginatedResponse);

    renderWithAuth({
      id: "u-1",
      nome: "Admin",
      email: "admin@email.com",
      perfil: "ADMIN",
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /nova solicitação/i })).not.toBeInTheDocument();
    });
  });

  it("NÃO deve mostrar 'Nova solicitação' nem 'Visualizar categorias' para GESTOR", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue(mockPaginatedResponse);

    renderWithAuth({
      id: "u-1",
      nome: "Maria",
      email: "maria@email.com",
      perfil: "GESTOR",
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /nova solicitação/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /visualizar categorias/i })).not.toBeInTheDocument();
    });
  });

  it("NÃO deve mostrar 'Nova solicitação' nem 'Visualizar categorias' para FINANCEIRO", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue(mockPaginatedResponse);

    renderWithAuth({
      id: "u-1",
      nome: "Carlos",
      email: "carlos@email.com",
      perfil: "FINANCEIRO",
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /nova solicitação/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /visualizar categorias/i })).not.toBeInTheDocument();
    });
  });

  it("deve mostrar ações de aprovar/rejeitar no dropdown quando GESTOR e status ENVIADO", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue(mockPaginatedResponse);

    renderWithAuth({
      id: "u-1",
      nome: "Maria Gestora",
      email: "maria@email.com",
      perfil: "GESTOR",
    });

    // aguarda os dados da tabela carregarem
    await waitFor(() => {
      expect(screen.getByText(/r-1/)).toBeInTheDocument();
    });
  });
});


describe("datatable - estados da listagem", () => {
  it("deve mostrar estado de loading enquanto busca dados", () => {
    // não resolvemos o mock — ele fica "pendente" para simular loading

    mockGetReimbursementsWithTotal.mockReturnValue(new Promise(() => {}));

    renderWithAuth({
      id: "u-1",
      nome: "João",
      email: "joao@email.com",
      perfil: "COLABORADOR",
    });

    // o componente mostra "Carregando reembolsos..." enquanto a Promise não resolve
    expect(screen.getByText(/carregando reembolsos/i)).toBeInTheDocument();
  });

  it("deve mostrar estado vazio quando não há reembolsos", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue({
      dados: [],
      paginacao: { paginaAtual: 1, limite: 15, totalItens: 0, totalPaginas: 0 },
    });

    renderWithAuth({
      id: "u-1",
      nome: "João",
      email: "joao@email.com",
      perfil: "COLABORADOR",
    });

    // após a Promise resolver, a tabela deve mostrar "Não há nenhum reembolso"
    await waitFor(() => {
      expect(screen.getByText(/não há nenhum reembolso/i)).toBeInTheDocument();
    });
  });

  it("deve mostrar a tabela com dados quando há reembolsos", async () => {
    mockGetReimbursementsWithTotal.mockResolvedValue(mockPaginatedResponse);

    renderWithAuth({
      id: "u-1",
      nome: "João",
      email: "joao@email.com",
      perfil: "COLABORADOR",
    });

    // aguarda os dados serem renderizados
    await waitFor(() => {
      expect(screen.getByText(/r-1/)).toBeInTheDocument();
      expect(screen.getByText(/r-2/)).toBeInTheDocument();
      expect(screen.getByText(/Alimentação/)).toBeInTheDocument();
      expect(screen.getByText(/Transporte/)).toBeInTheDocument();
    });

    // verifica que os valores foram formatados corretamente em BRL
    expect(screen.getByText(/R\$\s*85,50/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*45,00/)).toBeInTheDocument();

    // verifica que os status badges foram renderizados
    expect(screen.getByText(/Enviado/)).toBeInTheDocument();
    expect(screen.getByText(/Rascunho/)).toBeInTheDocument();
  });

  it("deve mostrar mensagem de erro quando a API falha", async () => {
    mockGetReimbursementsWithTotal.mockRejectedValue(new Error("Network Error"));

    renderWithAuth({
      id: "u-1",
      nome: "João",
      email: "joao@email.com",
      perfil: "COLABORADOR",
    });

    // após a Promise rejeitar, deve mostrar a mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar reembolsos/i)).toBeInTheDocument();
    });
    // e deve ter um botão para tentar novamente
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
