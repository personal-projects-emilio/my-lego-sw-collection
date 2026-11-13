import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  redirect,
  type RouteIds,
  stripSearchParams,
} from '@tanstack/react-router'
import Layout from 'components/Layout'
import { addMinifigSearchSchema, addSetSearchSchema } from 'constants/routes'
import Auth from 'pages/Auth'
import LooseMinifigs from 'pages/LooseMinifigs'
import AddLooseMinifigFormModal from 'pages/LooseMinifigs/AddLooseMinifigFormModal'
import Minifigs from 'pages/Minifigs'
import {
  AddMinifigFormModal,
  EditMinifigFormModal,
} from 'pages/Minifigs/components'
import Sets from 'pages/Sets'
import { AddSetFormModal, EditSetFormModal } from 'pages/Sets/components'
import { looseObject } from 'zod'

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
  // zod 4 types object({}) as Record<string, never>, which breaks ToOptions unions; the middleware strips params anyway
  validateSearch: looseObject({}),
  search: {
    middlewares: [stripSearchParams(true)],
  },
})

const minifigAddRoute = createRoute({
  getParentRoute: () => minifigsRoute,
  path: '/add',
  component: () => <AddMinifigFormModal />,
  validateSearch: addMinifigSearchSchema,
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
  validateSearch: looseObject({}),
  search: {
    middlewares: [stripSearchParams(true)],
  },
})

const setAddRoute = createRoute({
  getParentRoute: () => setsRoute,
  path: '/add',
  component: () => <AddSetFormModal />,
  validateSearch: addSetSearchSchema,
})

const looseMinifigsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/loose-minifigs',
  component: LooseMinifigs,
})

const looseMinifigAddRoute = createRoute({
  getParentRoute: () => looseMinifigsRoute,
  path: '/add',
  component: () => <AddLooseMinifigFormModal />,
  validateSearch: looseObject({}),
  search: {
    middlewares: [stripSearchParams(true)],
  },
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: Auth,
})

const routeTree = rootRoute.addChildren([
  minifigsRoute.addChildren([minifigAddRoute, minifigEditRoute]),
  setsRoute.addChildren([setAddRoute, setEditRoute]),
  looseMinifigsRoute.addChildren([looseMinifigAddRoute]),
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
