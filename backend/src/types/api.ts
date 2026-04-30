// respostas da API

// sucesso
// <T> é um placeholder que pode mudar dependendo do contexto, logo, podem haver vários tipos de resposta
export interface ApiResponse<T>{
    data: T;
}

// erro
export interface ErrorResponse {
    message: string;
    statusCode: number;
    error: string;
}