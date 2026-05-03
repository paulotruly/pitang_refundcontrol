import { createRouter, createRootRoute, createRoute} from '@tanstack/react-router'
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Interface from './pages/Interface';

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
})

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: Register,
})

const interfaceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/interface',
    component: Interface,
})

const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    interfaceRoute
])

const router = createRouter({routeTree})

export default router