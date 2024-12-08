import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  redirect,
  type RouteIds,
} from '@tanstack/react-router'
import Layout from 'components/Layout'
import Auth from 'pages/Auth'
import Minifigs from 'pages/Minifigs'
import Sets from 'pages/Sets'

const basePath = import.meta.env.BASE_URL

const rootRoute = createRootRoute({
  component: Layout,
  loader: (props) => {
    if (props.cause !== 'enter' || props.location.pathname !== basePath) return
    throw redirect({ to: '/minifigs' })
  },
  notFoundComponent: () => <Navigate to="/minifigs" />,
})

const minifigsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/minifigs',
  component: Minifigs,
})

const setsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sets',
  component: Sets,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: Auth,
})

const routeTree = rootRoute.addChildren([minifigsRoute, setsRoute, authRoute])

export const router = createRouter({
  routeTree,
  basepath: basePath,
})

export type RouterRouteIds = Exclude<RouteIds<typeof routeTree>, '__root__'>

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
