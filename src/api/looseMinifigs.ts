import { useQuery } from '@tanstack/react-query'
import type { LooseMinifigsList } from 'types/minifigs'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

// Public read, like minifigs, since loose quantities feed the public owned totals
const fetchLooseMinifigs = () =>
  api
    .get<LooseMinifigsList | null>(endPoints.looseMinifigs)
    // The Realtime DB returns null for an empty or missing path
    .then(({ data }) => data ?? [])

export const mutateLooseMinifigs = async (data: LooseMinifigsList) =>
  await api.put<LooseMinifigsList | null>(endPoints.looseMinifigs, data)

/** Used to update local query cache */
export const setLooseMinifigsQueryData = (data: LooseMinifigsList) =>
  queryClient.setQueryData([queryKeys.looseMinifigs], data)

export const useLooseMinifigsQuery = () =>
  useQuery({
    queryKey: [queryKeys.looseMinifigs],
    queryFn: fetchLooseMinifigs,
  })
