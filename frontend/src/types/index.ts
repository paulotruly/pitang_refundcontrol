export type Perfil = "COLABORADOR" | "GESTOR" | "FINANCEIRO" | "ADMIN";
export type ReimbursementStatus = "CANCELADO" | "PAGO" | "REJEITADO" | "APROVADO" | "ENVIADO" | "RASCUNHO";

export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface UserResponse extends User {}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface Reimbursement {
  id: string;
  categoria: Category;
  descricao: string;
  valor: number;
  status: ReimbursementStatus;
  dataDespesa: string;
  solicitanteId: string;
  solicitante?: {
    nome: string
    email: string
  }
}

export interface ReimbursementResponse {
    dados: Reimbursement[]
    paginacao: {
      paginaAtual: number,
      limite: number,
      totalItens: number,
      totalPaginas: number
    }
}

export interface Category {
  id: string;
  nome: string;
  ativo: boolean;
}