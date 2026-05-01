import { Perfil } from "../prisma.js";

// definindo a forma do objeto que vai dentro do token JWT
export interface JwtPayload {
    sub: string; // subject ~ sujeito: guarda o id do usuário
    email: string;
    perfil: Perfil; // vai ser usado por um futuro middleware pra verificar permissões
}