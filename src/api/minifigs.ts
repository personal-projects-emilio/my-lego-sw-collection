import { useQuery } from '@tanstack/react-query'
import type { Minifig, MinifigsList } from 'types/minifigs'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

// owned.total and owned.inSet are calculated by buildCollection: stored values are ignored and never written
const withoutCalculated = ({ owned, ...minifig }: Minifig): Minifig => ({
  ...minifig,
  owned: { loose: owned.loose, total: 0, inSet: [] },
})

const fetchMinifigs = () =>
  api
    .get<MinifigsList>(endPoints.minifigs)
    .then((res) => res.data.map(withoutCalculated))

export const mutateMinifigs = async (data: MinifigsList) => {
  const res = await api.put<MinifigsList>(
    endPoints.minifigs,
    data.map(({ owned, ...minifig }) => ({
      ...minifig,
      owned: { loose: owned.loose },
    }))
  )
  return { ...res, data: res.data.map(withoutCalculated) }
}

/** Used to update local query cache */
export const setMinifigsQueryData = (data: MinifigsList) =>
  queryClient.setQueryData([queryKeys.minifigs], data)

export const useMinifigsQuery = () =>
  useQuery({
    queryKey: [queryKeys.minifigs],
    queryFn: fetchMinifigs,
  })
