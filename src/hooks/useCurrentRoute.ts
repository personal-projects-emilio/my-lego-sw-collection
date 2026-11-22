import { useMatches } from '@tanstack/react-router'
import type { RouterRouteIds } from 'routes'

const defaultRoutesToCheck: string[] = [
  '/auth',
  '/loose-minifigs',
  '/minifigs',
  '/resale-sets',
  '/sets',
  '/timeline',
] satisfies RouterRouteIds[]

const useCurrentRoute = (routes = defaultRoutesToCheck) => {
  return useMatches({
    select: (matches) => ({
      id: matches.find((el) => routes.includes(el.routeId))?.routeId ?? false,
    }),
  })
}

export default useCurrentRoute
