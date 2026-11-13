import { useQuery } from '@tanstack/react-query'
import type { Minifig, MinifigsList } from 'types/minifigs'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

// The DB may still hold owned.total and owned.inSet from the old Sync: drop them on read
const withoutCalculated = ({ owned, ...minifig }: Minifig): Minifig => ({
  ...minifig,
  owned: { loose: owned.loose },
})

const fetchMinifigs = () =>
  api
    .get<MinifigsList>(endPoints.minifigs)
    .then((res) => res.data.map(withoutCalculated))

export const mutateMinifigs = async (data: MinifigsList) =>
  await api.put<MinifigsList>(endPoints.minifigs, data)

/** Used to update local query cache */
export const setMinifigsQueryData = (data: MinifigsList) =>
  queryClient.setQueryData([queryKeys.minifigs], data)

export const useMinifigsQuery = () =>
  useQuery({
    queryKey: [queryKeys.minifigs],
    queryFn: fetchMinifigs,
  })
