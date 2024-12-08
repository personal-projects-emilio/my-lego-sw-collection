import { useMatches } from '@tanstack/react-router'
import type { RouterRouteIds } from 'routes'

const defaultRoutesToCheck = [
  '/auth',
  '/minifigs',
  '/sets',
] satisfies RouterRouteIds[] as string[]

const useCurrentRoute = (routes = defaultRoutesToCheck) => {
  return useMatches({
    select: (matches) =>
      matches.find((el) => routes.includes(el.id)) ?? {
        id: '/',
      },
  })
}

export default useCurrentRoute
