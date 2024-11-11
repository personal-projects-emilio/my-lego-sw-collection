import { useQuery } from '@tanstack/react-query'
import { MinifigsList } from 'types/minifigs'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

const fetchMinifigs = () =>
  api.get<MinifigsList>(endPoints.minifigs).then((res) => res.data)

export const mutateMinifigs = async (data: MinifigsList) =>
  await api.put(endPoints.minifigs, data)

// Refetch the minifigs (after a mutation)
export const invalidateMinifigsQuery = () =>
  queryClient.invalidateQueries({ queryKey: [queryKeys.minifigs] })

// Used to update local query cache for non authorized users
export const setMinifigsQueryData = (data: MinifigsList) =>
  queryClient.setQueryData([queryKeys.minifigs], data)

export const useMinifigsQuery = () =>
  useQuery({
    queryKey: [queryKeys.minifigs],
    queryFn: fetchMinifigs,
  })
