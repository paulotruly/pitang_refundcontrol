import { createRouter, createRootRoute, createRoute, redirect} from '@tanstack/react-router'
import Login from './pages/Login';
import Register from './pages/Register';
import Interface from './pages/Interface';
import { getToken } from './lib/cookies';
import type { Perfil } from './types';
import Solicitacoes from './pages/Solicitacoes';
import Categorias from './pages/Categorias';
import Home from './pages/Home';

function getUserRole(): Perfil | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // não entendi o que é isso 
    return payload.perfil as Perfil; // não entendi o que é isso
  } catch {
    return null;
  }
}

function requireAuth() {
  if (!getToken()) throw redirect({ to: '/login' });
}

// exige que o perfil esteja na lista, senão redireciona pro /interface
function requireRole(...allowed: Perfil[]) {
  requireAuth();
  const role = getUserRole();
  if (!role || !allowed.includes(role)) {
    throw redirect({ to: '/interface' });
  }
}

const rootRoute = createRootRoute()

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
    beforeLoad: () => {
        if (getToken()) throw redirect({to: '/interface'});
    },
})

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: Register,
    beforeLoad: () => {
        if (getToken()) throw redirect({ to: '/interface' });
    },
})

const interfaceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/interface',
    component: Interface,
    beforeLoad: () => requireAuth(),
})

// criei a rota base de solicitações, que já exige autenticação e permite vários perfis acessarem
const solicitacoesRoute = createRoute({
    getParentRoute: () => interfaceRoute,
    path: 'solicitacoes',
    component: Solicitacoes,
    beforeLoad: () => requireRole('COLABORADOR', 'GESTOR', 'FINANCEIRO', 'ADMIN'),
})

const categoriasRoute = createRoute({
    getParentRoute: () => interfaceRoute,
    path: 'categorias',
    component: Categorias,
    beforeLoad: () => requireRole('ADMIN'),
})

export const createCategoryRoute = createRoute({
  getParentRoute: () => categoriasRoute,
  path: 'create',
})

// corrigindo a rota de edição de categoria para aceitar o parâmetro id
export const editCategoryRoute = createRoute({
  getParentRoute: () => categoriasRoute,
  path: 'edit/$id',
})

const interfaceIndexRoute = createRoute({
  getParentRoute: () => interfaceRoute,
  path: '/', 
  component: Solicitacoes,
})

// criei rotas filhas de solicitacoes para representar ações específicas (create e edit),
// em vez de usar estado pra abrir modal, cada ação agora tem uma URL própria
export const createReimbursementRoute = createRoute({
  getParentRoute: () => solicitacoesRoute,
  path: 'create',
})

export const editReimbursementRoute = createRoute({
  getParentRoute: () => solicitacoesRoute,
  path: 'edit/$id',
})

const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    interfaceRoute.addChildren([
        interfaceIndexRoute,

        solicitacoesRoute.addChildren([
            createReimbursementRoute,
            editReimbursementRoute
        ]),
        categoriasRoute.addChildren([
            createCategoryRoute,
            editCategoryRoute
        ]),
    ])
])

const router = createRouter({routeTree})

export default router