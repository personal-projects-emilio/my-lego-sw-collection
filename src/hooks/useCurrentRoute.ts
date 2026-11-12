import { useMatches } from '@tanstack/react-router'
import type { RouterRouteIds } from 'routes'

const defaultRoutesToCheck = [
  '/auth',
  '/minifigs',
  '/sets',
] satisfies RouterRouteIds[] as string[]

const useCurrentRoute = (routes = defaultRoutesToCheck) => {
  return useMatches({
    // match.id includes the interpolated path (e.g. `/sets/sets`), routeId is the route's id
    select: (matches) => ({
      // false = no tab selected (MUI Tabs rejects values that match no tab)
      id: matches.find((el) => routes.includes(el.routeId))?.routeId ?? false,
    }),
  })
}

export default useCurrentRoute
