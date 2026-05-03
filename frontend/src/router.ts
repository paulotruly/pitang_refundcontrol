import { createRouter, createRootRoute, createRoute, redirect} from '@tanstack/react-router'
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Interface from './pages/Interface';
import { getToken } from './lib/cookies';

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
    const token = getToken();
        if (token) {
            throw redirect({ to: '/interface' });
        }
    },
})

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: Register,
    beforeLoad: () => {
    const token = getToken();
        if (token) {
            throw redirect({ to: '/interface' });
        }
    },
})

const interfaceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/interface',
    component: Interface,
    beforeLoad: () => {
        const token = getToken();
        if (!token) {
            throw redirect({ to: '/login' });
        }
    },
})

const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    interfaceRoute
])

const router = createRouter({routeTree})

export default router