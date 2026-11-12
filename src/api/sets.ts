import { useQuery } from '@tanstack/react-query'
import type { Set, SetsList } from 'types/sets'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

type StoredSet = Set & {
  imagePath?: string | null
  prices: { bricklinkSoldPriceUsed?: number }
}

// shortcut: renames the legacy imagePath and bricklinkSoldPriceUsed keys on read, remove once a Brickset import has rewritten every set
const withRenamedLegacyKeys = ({
  imagePath,
  prices: { bricklinkSoldPriceUsed, ...prices },
  ...set
}: StoredSet): Set => ({
  ...set,
  bricksetImagePath: set.bricksetImagePath ?? imagePath ?? null,
  prices: {
    ...prices,
    brickLinkSoldPriceUsed:
      prices.brickLinkSoldPriceUsed ?? bricklinkSoldPriceUsed ?? 0,
  },
})

export const fetchSets = () =>
  api
    .get<StoredSet[]>(endPoints.sets)
    .then((res) => res.data.map(withRenamedLegacyKeys))

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
