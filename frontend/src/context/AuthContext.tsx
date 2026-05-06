import { setToken, getUserId, setUserId, removeToken, removeUserId, setRefreshToken, getRefreshToken, removeRefreshToken} from "@/lib/cookies";
import type { AuthResponse, UserResponse } from "@/types";
import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import api from "@/lib/api";

// estados da autenticação
type AuthState = {
    user: UserResponse | null; 
    isAuthentic: boolean;    
    isLoading: boolean; 
}

// estados de ação
type AuthAction = 
    | { type: "LOGIN"; payload: UserResponse }     
    | { type: "LOGOUT" }       
    | { type: "SET_LOADING"; payload: boolean }        


// esse authreducer serve justamente pra definir o comportamento da autenticação AuthStater dependendo das ações que definimos no AuthAction
function AuthReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state, // copia tudo do AuthState
                user: action.payload, // os dados que acompanham a ação
                isAuthentic: true,
                isLoading: false
            };
        
        case "LOGOUT":
            return {
                ...state, 
                user: null,
                isAuthentic: false,
                isLoading: false
            };
        
        case "SET_LOADING":
            return {
                ...state, 
                isLoading: action.payload
            };
    }
}

// tipando todos os dados que o contexto da autenticaçao precisa expor pros componentes que usam useAuth()
// user agora é UserResponse porque o que guardamos no estado é apenas o user, não a resposta inteira do login
interface AuthContextType {
    user: UserResponse | null;
    isAuthentic: boolean;
    isLoading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
}

// criando de fato o contexto - isso aqui seria os dados iniciais do contexto
export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthentic: false,
    isLoading: false,
    login: () => {},
    logout: () => {},
});

// aqui serve pra envolver toda a aplicação com o contexto de autenticação
interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({children}: AuthProviderProps) {
    
    // useReducer é como useState, mas para estado mais complexo, ele retorna um array com 2 coisas:
    //   state     → o estado atual
    //   dispatch  → função que "envia" ações pro AuthReducer processar

    const [state, dispatch] = useReducer(AuthReducer, {
        user: null, // estado inicial
        isAuthentic: false,
        isLoading: true
    });

    // recebe a resposta completa do login e salva nos cookies
    const login = (data: AuthResponse) => {
        setToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        setUserId(data.user.id)
        dispatch({ type: "LOGIN", payload: data.user })
    }

    const logout = async () => {
        try { // envia o refresh token na api pra revogar ele
                await api.post("/auth/logout", {refreshToken: getRefreshToken()});
        } catch {
            // ignora erro
        }
        removeToken();
        removeRefreshToken();
        removeUserId();
        dispatch({ type: "LOGOUT" });
    }

    // serve pra restaurar a sessão se o usuário recarregou a página
    // então verifica se há token e userId salvos, se sim, vamos na API validar se ainda estão bons
    useEffect(() => {
        const storedUserId = getUserId();

        if (storedUserId) {
            api.get(`/users/${storedUserId}`)
                .then((res) => {
                    dispatch({ type: "LOGIN", payload: res.data });
            })

            .catch(() => {
                removeToken();
                removeRefreshToken();
                removeUserId();
                dispatch({ type: "LOGOUT" });
            })

            // sempre sinaliza que a verificação de sessão acabou (para o loading)
            .finally(() => {
                dispatch({ type: "SET_LOADING", payload: false });
            });

        } else {
            // não tem token ou userId nos cookies
            // só desliga o isLoading pra a tela não ficar carregando pra sempre
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, []); // array vazio = roda SÓ uma vez ao montar o AuthProvider 
    
    return (
        <AuthContext.Provider // provendo pra todas as rotas os dados necessários para autenticação
            value={{
                user: state.user,
                isAuthentic: state.isAuthentic,
                isLoading: state.isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    
    return context;
}