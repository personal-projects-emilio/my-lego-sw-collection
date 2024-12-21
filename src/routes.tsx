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
import { addMinifigSearchSchema, addSetSearchSchema } from 'constants/routes'
import Auth from 'pages/Auth'
import Minifigs from 'pages/Minifigs'
import {
  AddMinifigFormModal,
  EditMinifigFormModal,
} from 'pages/Minifigs/components'
import Sets from 'pages/Sets'
import { AddSetFormModal, EditSetFormModal } from 'pages/Sets/components'
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

const minifigEditRoute = createRoute({
  getParentRoute: () => minifigsRoute,
  path: '/edit/$minifigId',
  component: () => <EditMinifigFormModal />,
  validateSearch: zodValidator(object({})),
  search: {
    middlewares: [stripSearchParams(true)],
  },
})

const minifigAddRoute = createRoute({
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

const setEditRoute = createRoute({
  getParentRoute: () => setsRoute,
  path: '/edit/$setId',
  params: {
    parse: ({ setId }) => ({
      setId: /\D/.test(setId) ? setId : parseInt(setId, 10),
    }),
  },
  component: () => <EditSetFormModal />,
  validateSearch: zodValidator(object({})),
  search: {
    middlewares: [stripSearchParams(true)],
  },
})

const setAddRoute = createRoute({
  getParentRoute: () => setsRoute,
  path: '/add',
  component: () => <AddSetFormModal />,
  validateSearch: zodValidator(addSetSearchSchema),
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: Auth,
})

const routeTree = rootRoute.addChildren([
  minifigsRoute.addChildren([minifigAddRoute, minifigEditRoute]),
  setsRoute.addChildren([setAddRoute, setEditRoute]),
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
