import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "../signup-form";
import axios from "axios";
import { getToken } from "@/lib/cookies";

// --------------------- MOCKS ---------------------

// mock do axios pra controlar as chamadas de API nos testes
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// mock das funções de cookie para simular estado de autenticação
jest.mock("@/lib/cookies", () => ({
  __esModule: true,
  getToken: jest.fn(),
  setToken: jest.fn(),
  setRefreshToken: jest.fn(),
  setUserId: jest.fn(),
  removeToken: jest.fn(),
  removeRefreshToken: jest.fn(),
  removeUserId: jest.fn(),
  getRefreshToken: jest.fn(),
  getUserId: jest.fn(),
}));

// mock do tanstack router para evitar erros de navegação
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => jest.fn(),
}));

// limpa mocks antes de cada teste
beforeEach(() => {
  (getToken as jest.Mock).mockReturnValue(undefined);
  jest.clearAllMocks();
});

// --------------------- TESTES ---------------------

describe("SignupForm - renderização", () => {
  // verifica se todos os campos do formulário de cadastro estão presentes
  // NOTA: usamos getByPlaceholderText pq os Labels do shadcn não têm htmlFor,
  // então getByLabelText não consegue associar label ao input
  it("deve renderizar campos de nome, email, senha, confirmar senha e botão", () => {
    render(<SignupForm />);

    expect(screen.getByPlaceholderText(/seu nome/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@company/i)).toBeInTheDocument();
    // senha e confirmar senha têm o mesmo placeholder "••••••••" - pega todos e verifica quantidade
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs).toHaveLength(2);
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
  });
});

describe("SignupForm - validações", () => {
  // tenta enviar formulário vazio e verifica erro de nome obrigatório
  it("deve exibir erro quando nome está vazio", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
  });

  // tenta enviar com senhas diferentes e verifica erro de confirmação
  it("deve exibir erro quando senhas não coincidem", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText(/seu nome/i), "João");
    await user.type(screen.getByPlaceholderText(/name@company/i), "joao@email.com");

    const [senhaInput, confirmarInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(senhaInput, "senha123");
    await user.type(confirmarInput, "senha456");

    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
  });

  // tenta enviar com email inválido e verifica erro
  // NOTA: usamos fireEvent.submit ao invés de click no botão pq o JSDOM
  // pode bloquear submit de input type="email" com valor sem @ (HTML5 validation)
  it("deve exibir erro quando email é inválido", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText(/seu nome/i), "João");
    await user.type(screen.getByPlaceholderText(/name@company/i), "sem-arroba");

    const [senhaInput, confirmarInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(senhaInput, "senha123");
    await user.type(confirmarInput, "senha123");

    // dispara submit direto no form pra evitar HTML5 validation do type="email"
    const form = document.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });
});

describe("SignupForm - submissão com sucesso", () => {
  // preenche todos os campos corretamente e verifica chamada da API
  it("deve cadastrar usuário com dados válidos", async () => {
    const user = userEvent.setup();

    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        id: "user-123",
        nome: "João",
        email: "joao@email.com",
        perfil: "COLABORADOR",
      },
    });

    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText(/seu nome/i), "João");
    await user.type(screen.getByPlaceholderText(/name@company/i), "joao@email.com");

    const [senhaInput, confirmarInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(senhaInput, "senha123");
    await user.type(confirmarInput, "senha123");

    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    // verifica se a API foi chamada com os dados corretos
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/users",
        { nome: "João", email: "joao@email.com", senha: "senha123" }
      );
    });

    // verifica mensagem de sucesso
    await waitFor(() => {
      expect(screen.getByText(/conta criada com sucesso/i)).toBeInTheDocument();
    });
  });

  // simula erro da API e verifica mensagem de erro
  it("deve exibir erro quando a API falha", async () => {
    const user = userEvent.setup();

    (axios.post as jest.Mock).mockRejectedValue({
      response: { data: { message: "Email já cadastrado" } },
    });

    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText(/seu nome/i), "João");
    await user.type(screen.getByPlaceholderText(/name@company/i), "existente@email.com");

    const [senhaInput, confirmarInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(senhaInput, "senha123");
    await user.type(confirmarInput, "senha123");

    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/email já cadastrado/i)).toBeInTheDocument();
    });
  });
});
