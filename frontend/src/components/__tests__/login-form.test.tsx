import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../login-form";
import api from "@/lib/api";
import { getToken } from "@/lib/cookies";
import type { AuthResponse } from "@/types";

// aqui serve para mockar a API, cookies e contexto de autenticação usados pelo LoginForm 
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(), // api.post() agora é uma função mock
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// mock das funções de cookie para controlar o estado de autenticação
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

// mock do contexto de autenticação para controlar o estado do usuário
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    user: null,
    isAuthentic: false,
    isLoading: false,
  }),
}));

// mock do tanstack router para evitar erros de navegação durante os testes
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => jest.fn(),
}));

// antes de cada teste, limpamos os mocks para garantir que não haja interferência entre os testes
beforeEach(() => {
  (getToken as jest.Mock).mockReturnValue(undefined);
  jest.clearAllMocks();
});

describe("loginform - renderização", () => {
  it("deve renderizar o formulário com campos de email, senha e botão Entrar", () => {
    // render() cria uma versão "virtual" do DOM (jsdom) e
    // renderiza o componente dentro dele, como se fosse o navegador
    render(<LoginForm />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    expect(submitButton).not.toBeDisabled();
  });
});

describe("loginform - submissão com sucesso", () => {
  it("deve fazer login com credenciais válidas e redirecionar", async () => {
    // userEvent.setup() cria uma instância que simula interações
    // de usuário de forma assíncrona (mais fiel ao mundo real)
    const user = userEvent.setup();

    // mockamos a resposta da API para simular um login bem-sucedido
    // o shape precisa ser igual ao que o backend retorna (AuthResponse)
    const mockAuthResponse: AuthResponse = {
      accessToken: "fake-jwt-token",
      refreshToken: "fake-refresh-token",
      user: {
        id: "user-123",
        nome: "João Silva",
        email: "joao@email.com",
        perfil: "COLABORADOR",
      },
    };

    // api.post as jeck.Mock diz que o método post do nosso mock de API é uma função mock do Jest
    // .mockResolvedValue() faz com que essa função retorne uma Promise que resolve com o valor fornecido
    // data: mockAuthResponse simula a estrutura da resposta do Axios, onde os dados estão na propriedade `data`
    (api.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });

    render(<LoginForm />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);

    // type() digita caractere por caractere, como um humano faria
    // (diferente de .fireEvent.change que só altera o valor de uma vez)
    await user.type(emailInput, "joao@email.com");
    await user.type(passwordInput, "senha123");

    // simula o clique no botão de submit
    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    // durante o loading, o botão deve mostrar "Entrando..." e estar desabilitado
    // waitFor é essencial aqui porque a mudança de estado é assíncrona
    // (a API retorna uma Promise). sem waitFor, o expect rodaria ANTES
    // do componente atualizar, causando falso negativo
    await waitFor(() => {
      expect(screen.getByText(/entrando/i)).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "joao@email.com",
      senha: "senha123",
    });
  });
});


describe("loginform - erro com credenciais inválidas", () => {
  it("deve exibir mensagem de erro quando o login falhar", async () => {
    const user = userEvent.setup();

    // simula um erro 401 (não autorizado) do Axios
    // o Axios rejeita a Promise com um objeto Error que tem
    // a propriedade `response` contendo status e data
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        status: 401,
        data: { message: "Credenciais inválidas" },
      },
    });

    render(<LoginForm />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "errado@email.com");
    await user.type(passwordInput, "senhaerrada");

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    // a mensagem de erro deve aparecer na tela
    // o LoginForm renderiza <p className="text-red-500">{error}</p>
    // usamos findByText (assíncrono) que já faz waitFor internamente
    const errorMessage = await screen.findByText(/credenciais inválidas/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-red-500");

    // o botão deve voltar a estar habilitado após o erro
    expect(submitButton).not.toBeDisabled();
  });
});