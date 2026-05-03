export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: string;
}

export interface UserResponse extends User {}

export interface AuthResponse extends User {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}