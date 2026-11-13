import { useQuery } from '@tanstack/react-query'
import type { LooseMinifigsList } from 'types/minifigs'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

const fetchLooseMinifigs = () =>
  api
    .get<LooseMinifigsList | null>(endPoints.looseMinifigs)
    .then(({ data }) => data ?? [])

export const mutateLooseMinifigs = async (data: LooseMinifigsList) =>
  await api.put<LooseMinifigsList | null>(endPoints.looseMinifigs, data)

export const setLooseMinifigsQueryData = (data: LooseMinifigsList) =>
  queryClient.setQueryData([queryKeys.looseMinifigs], data)

export const useLooseMinifigsQuery = () =>
  useQuery({
    queryKey: [queryKeys.looseMinifigs],
    queryFn: fetchLooseMinifigs,
  })
