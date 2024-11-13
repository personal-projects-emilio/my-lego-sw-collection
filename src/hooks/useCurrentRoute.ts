import { useMatches } from '@tanstack/react-router'
import { RouterRouteIds } from 'routes'

const defaultRoutesToCheck = ['/auth', '/minifigs'] satisfies RouterRouteIds[]

export const useCurrentRoute = (routes = defaultRoutesToCheck) => {
  return useMatches({
    select: (matches) =>
      matches.find((el) => routes.includes(el.id as RouterRouteIds)) ?? {
        id: '/',
      },
  })
}
