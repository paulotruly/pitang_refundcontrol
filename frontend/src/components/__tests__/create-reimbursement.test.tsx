import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateReimbursement from "../create-reimbursement";
import { getCategoriesWithTotal, createReimbursement } from "@/api/reimbursements";

// mock serve pra substituir as funções reais por versões controladas nos testes

// mock das funções da API
jest.mock("@/api/reimbursements", () => ({
  getCategoriesWithTotal: jest.fn(),
  createReimbursement: jest.fn(),
  uploadAttachment: jest.fn(),
}));

// mock do router 
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => jest.fn(),
  useMatch: () => undefined,
}));

// mock do router personalizado (que tem a função invalidate, que serve para forçar atualização de dados em outras telas) 
jest.mock("@/router", () => ({
  __esModule: true,
  default: { invalidate: jest.fn() },
}));

// helpers para acessar os mocks tipados corretamente
// precisamos criar essas variáveis para acessar os métodos .mockResolvedValue() e .mockRejectedValue() com tipagem correta
const mockGetCategories = getCategoriesWithTotal as jest.Mock;
const mockCreateReimbursement = createReimbursement as jest.Mock;

// helper pra renderizar o componente com as props mínimas necessárias para os testes
// componente é um modal, então se isOpen for false ele não renderiza nada (retorna null)
// por isso, nos testes, sempre passamos isOpen: true para garantir que o conteúdo do modal
// seja renderizado e possa ser testado
function renderComponent(props: Partial<React.ComponentProps<typeof CreateReimbursement>> = {}) {
  return render(
    <CreateReimbursement
      isOpen={true}
      onClose={jest.fn()}
      {...props}
    />
  );
}

// limpa os mocks antes de cada teste para evitar contaminação entre testes
beforeEach(() => {
  jest.resetAllMocks();
  // categorias vazias
  mockGetCategories.mockResolvedValue({ dados: [], paginacao: { paginaAtual: 1, limite: 15, totalItens: 0, totalPaginas: 0 } });
});

// ------------ testes -------------

describe("CreateReimbursement - campos obrigatórios", () => {
  it("deve exibir erro ao tentar enviar sem selecionar categoria", async () => {
    const user = userEvent.setup(); // simula interações do usuário (digitar, clicar, etc)
    renderComponent(); // renderiza o componente com as props padrão (isOpen: true, onClose: jest.fn(), etc)

    // preenchemos todos os campos EXCETO a categoria
    const descricao = screen.getByLabelText(/descrição/i);
    const valor = screen.getByLabelText(/valor/i);
    const dataDespesa = screen.getByLabelText(/data da despesa/i);

    await user.type(descricao, "Almoço com cliente");
    await user.type(valor, "50");
    await user.type(dataDespesa, "2026-01-15");

    // disparamos o submit clicando no botão "Salvar como rascunho"
    const submitButton = screen.getByRole("button", { name: /salvar como rascunho/i });
    await user.click(submitButton);

    // o validateForm deve barrar e mostrar a mensagem de erro
    // o componente renderiza o erro em um <p> com classe text-red-400
    // buscamos pelo elemento <p> dentro da div de erro para evitar
    // conflito com o texto da opção do select
    const errorMessage = screen.getByText((content, element) => { 
      return (
        element?.tagName.toLowerCase() === "p" && // garante que é o parágrafo de erro, não a opção do select
        content.includes("Selecione uma categoria") && // verifica o texto do erro
        element.classList.contains("text-red-400") // garante que é o elemento estilizado como erro
      );
    });
    expect(errorMessage).toBeInTheDocument(); // o erro deve estar visível para o usuário

    // A API NÃO deve ter sido chamada, a validação impediu o envio
    expect(createReimbursement).not.toHaveBeenCalled();
  });



  it("deve exibir erro ao tentar enviar sem descrição", async () => {
    const user = userEvent.setup();

    // mock com uma categoria disponível para selecionar
    mockGetCategories.mockResolvedValue({
      dados: [{ id: "cat-1", nome: "Alimentação", ativo: true }],
      paginacao: { paginaAtual: 1, limite: 15, totalItens: 1, totalPaginas: 1 },
    });

    renderComponent();

    // espera a categoria ser carregada e renderizada no select
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Alimentação" })).toBeInTheDocument();
    });

    // seleciona a categoria
    const select = screen.getByRole("combobox", { name: /categoria/i });
    await user.selectOptions(select, "cat-1");

    // preenche valor e data, mas NÃO preenche descrição
    const valor = screen.getByLabelText(/valor/i);
    const dataDespesa = screen.getByLabelText(/data da despesa/i);
    await user.type(valor, "50");
    await user.type(dataDespesa, "2026-01-15");

    const submitButton = screen.getByRole("button", { name: /salvar como rascunho/i });
    await user.click(submitButton);

    // a validação deve barrar por falta de descrição
    // as "/" são usadas para criar uma regex, e o "i" no final torna a busca case-insensitive
    // regex é útil para buscar o texto do erro sem se preocupar com variações de maiúsculas/minúsculas ou acentos
    expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument();
    expect(createReimbursement).not.toHaveBeenCalled();
  });



  it("deve exibir erro ao tentar enviar com valor zero ou negativo", async () => {
    const user = userEvent.setup();

    mockGetCategories.mockResolvedValue({
      dados: [{ id: "cat-1", nome: "Transporte", ativo: true }],
      paginacao: { paginaAtual: 1, limite: 15, totalItens: 1, totalPaginas: 1 },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Transporte" })).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: /categoria/i });
    await user.selectOptions(select, "cat-1");

    const descricao = screen.getByLabelText(/descrição/i);
    const valor = screen.getByLabelText(/valor/i);
    const dataDespesa = screen.getByLabelText(/data da despesa/i);
    await user.type(descricao, "Uber para reunião");
    await user.type(valor, "-10");
    await user.type(dataDespesa, "2026-01-15");

    // dispara o submit no form diretamente
    const form = document.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/valor deve ser maior que zero/i)).toBeInTheDocument();
    });
    expect(createReimbursement).not.toHaveBeenCalled();
  });




  it("deve exibir erro ao tentar enviar sem data da despesa", async () => {
    const user = userEvent.setup();

    mockGetCategories.mockResolvedValue({
      dados: [{ id: "cat-1", nome: "Material", ativo: true }],
      paginacao: { paginaAtual: 1, limite: 15, totalItens: 1, totalPaginas: 1 },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Material" })).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: /categoria/i });
    await user.selectOptions(select, "cat-1");

    const descricao = screen.getByLabelText(/descrição/i);
    const valor = screen.getByLabelText(/valor/i);
    await user.type(descricao, "Caderno e canetas");
    await user.type(valor, "25");

    await user.click(screen.getByRole("button", { name: /salvar como rascunho/i }));

    expect(screen.getByText(/data da despesa é obrigatória/i)).toBeInTheDocument();
    expect(createReimbursement).not.toHaveBeenCalled();
  });



  it("deve exigir comprovante para valores acima de R$ 100,00", async () => {
    const user = userEvent.setup();

    mockGetCategories.mockResolvedValue({
      dados: [{ id: "cat-1", nome: "Hospedagem", ativo: true }],
      paginacao: { paginaAtual: 1, limite: 15, totalItens: 1, totalPaginas: 1 },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Hospedagem" })).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: /categoria/i });
    await user.selectOptions(select, "cat-1");

    const descricao = screen.getByLabelText(/descrição/i);
    const valor = screen.getByLabelText(/valor/i);
    const dataDespesa = screen.getByLabelText(/data da despesa/i);
    await user.type(descricao, "Hotel em São Paulo");
    await user.type(valor, "250");
    await user.type(dataDespesa, "2026-02-10");

    await user.click(screen.getByRole("button", { name: /salvar como rascunho/i }));

    expect(screen.getByText(/comprovante é obrigatório/i)).toBeInTheDocument();
    expect(createReimbursement).not.toHaveBeenCalled();
    // deve mostrar o asterisco vermelho indicando obrigatoriedade
    expect(screen.getByText("*")).toBeInTheDocument();
  });



  it("deve submeter com sucesso quando todos os campos estão preenchidos corretamente", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSuccess = jest.fn();

    mockGetCategories.mockResolvedValue({
      dados: [{ id: "cat-1", nome: "Alimentação", ativo: true }],
      paginacao: { paginaAtual: 1, limite: 15, totalItens: 1, totalPaginas: 1 },
    });

    mockCreateReimbursement.mockResolvedValue({
      id: "reimb-1",
      categoria: { id: "cat-1", nome: "Alimentação", ativo: true },
      descricao: "Almoço com cliente",
      valor: 50,
      status: "RASCUNHO",
      dataDespesa: "2026-01-15",
      solicitanteId: "user-1",
    });

    renderComponent({ onClose, onSuccess });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Alimentação" })).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: /categoria/i });
    await user.selectOptions(select, "cat-1");
    const descricao = screen.getByLabelText(/descrição/i);
    const valor = screen.getByLabelText(/valor/i);
    const dataDespesa = screen.getByLabelText(/data da despesa/i);
    await user.type(descricao, "Almoço com cliente");
    await user.type(valor, "50");
    await user.type(dataDespesa, "2026-01-15");
    await user.click(screen.getByRole("button", { name: /salvar como rascunho/i }));

    // a API deve ter sido chamada com os dados corretos
    await waitFor(() => {
      expect(createReimbursement).toHaveBeenCalledWith({
        categoriaId: "cat-1",
        descricao: "Almoço com cliente",
        valor: 50,
        dataDespesa: "2026-01-15",
      });
    });

    // o callback onSuccess deve ter sido chamado com o ID do novo reembolso
    expect(onSuccess).toHaveBeenCalledWith("reimb-1");
    // o modal deve ter sido fechado
    expect(onClose).toHaveBeenCalled();
  });
});
