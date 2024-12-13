import { useQuery } from '@tanstack/react-query'
import type { SetsList } from 'types/sets'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

export const fetchSets = () =>
  api.get<SetsList>(endPoints.sets).then((res) => res.data)

export const mutateSets = async (data: SetsList) =>
  await api.put<SetsList>(endPoints.sets, data)

/** Used to update local query cache */
export const setSetsQueryData = (data: SetsList) =>
  queryClient.setQueryData([queryKeys.sets], data)

export const useSetsQuery = () =>
  useQuery({
    queryKey: [queryKeys.sets],
    queryFn: fetchSets,
  })
