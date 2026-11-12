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

const emptyDimensions = { depth: null, height: null, width: null }

// The Realtime DB drops null values and empty arrays, and whole objects holding only those
const withDroppedValues = (set: Set): Set => ({
  ...set,
  appearances: set.appearances ?? [],
  tags: set.tags ?? [],
  timelines: set.timelines ?? [],
  EAN: set.EAN ?? null,
  UPC: set.UPC ?? null,
  exitDate: set.exitDate ?? null,
  content: {
    bags: set.content?.bags ?? null,
    box: set.content?.box ?? null,
    notice: set.content?.notice ?? null,
    partsQuantity: set.content?.partsQuantity ?? null,
    minifigs: set.content?.minifigs ?? [],
  },
  dimensions: {
    box: { ...emptyDimensions, ...set.dimensions?.box },
    model: { ...emptyDimensions, ...set.dimensions?.model },
  },
})

const fromStoredSets = (sets: StoredSet[]) =>
  sets.map((set) => withDroppedValues(withRenamedLegacyKeys(set)))

export const fetchSets = () =>
  api.get<StoredSet[]>(endPoints.sets).then((res) => fromStoredSets(res.data))

export const mutateSets = async (data: SetsList) => {
  const res = await api.put<StoredSet[]>(endPoints.sets, data)
  return { ...res, data: fromStoredSets(res.data) }
}

/** Used to update local query cache */
export const setSetsQueryData = (data: SetsList) =>
  queryClient.setQueryData([queryKeys.sets], data)

export const useSetsQuery = () =>
  useQuery({
    queryKey: [queryKeys.sets],
    queryFn: fetchSets,
  })
