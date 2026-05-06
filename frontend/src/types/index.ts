export type Perfil = "COLABORADOR" | "GESTOR" | "FINANCEIRO" | "ADMIN";
export type ReimbursementStatus = "CANCELADO" | "PAGO" | "REJEITADO" | "APROVADO" | "ENVIADO" | "RASCUNHO";
export type HistoryActions = "CREATED" | "UPDATED" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID" | "CANCELED";

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

export interface CreateReimbursementInput {
  categoriaId: string;
  descricao: string;
  valor: number;
  dataDespesa: string;
}

export interface CreateCategoryInput{
  nome: string;
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

export interface CategoryResponse {
    dados: Category[]
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
  deletadoEm?: string | null; // adicionado para suportar o campo de data de deleção
}

export interface UpdateCategoryInput {
  nome?: string;
  ativo?: boolean;
  deletadoEm?: string | null; 
}

export interface ReimbursementHistoryItem {
  id: string;
  solicitacaoId: string;
  usuarioId: string;
  acao: HistoryActions;
  observacao?: string;
  criadoEm: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

export interface GetReimbursementsParams {
  pagina?: number
  limite?: number
  status?: string
  categoria?: string
  busca?: string
  ordenarPor?: string
  ordem?: 'asc' | 'desc'
}
