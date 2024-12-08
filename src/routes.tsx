import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  redirect,
  type RouteIds,
  stripSearchParams,
} from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import Layout from 'components/Layout'
import { addMinifigSearchSchema } from 'constants/routes'
import Auth from 'pages/Auth'
import Minifigs from 'pages/Minifigs'
import {
  AddMinifigFormModal,
  EditMinifigFormModal,
} from 'pages/Minifigs/components'
import Sets from 'pages/Sets'
import { object } from 'zod'

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

const minifigEdit = createRoute({
  getParentRoute: () => minifigsRoute,
  path: '/edit/$minifigId',
  component: () => <EditMinifigFormModal />,
  validateSearch: zodValidator(object({})),
  search: {
    middlewares: [stripSearchParams(true)],
  },
})

const minifigAdd = createRoute({
  getParentRoute: () => minifigsRoute,
  path: '/add',
  component: () => <AddMinifigFormModal />,
  validateSearch: zodValidator(addMinifigSearchSchema),
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

const routeTree = rootRoute.addChildren([
  minifigsRoute.addChildren([minifigAdd, minifigEdit]),
  setsRoute,
  authRoute,
])

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
