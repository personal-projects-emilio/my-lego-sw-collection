import { useQuery } from '@tanstack/react-query'
import omit from 'lodash/omit'
import type { Set, SetsList } from 'types/sets'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

const emptyDimensions = { depth: null, height: null, width: null }

// The Realtime DB drops null values and empty arrays, and whole objects holding only those
const withDroppedValues = (set: Set): Set => ({
  ...set,
  appearances: set.appearances ?? [],
  tags: set.tags ?? [],
  timelines: set.timelines ?? [],
  bricksetImagePath: set.bricksetImagePath ?? null,
  EAN: set.EAN ?? null,
  UPC: set.UPC ?? null,
  exitDate: set.exitDate ?? null,
  retired: set.retired ?? false,
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

export const fetchSets = () =>
  api
    .get<SetsList>(endPoints.sets)
    .then((res) => res.data.map(withDroppedValues))

export const mutateSets = async (data: SetsList) => {
  const res = await api.put<SetsList>(
    endPoints.sets,
    data.map((set) => omit(set, 'possessed'))
  )
  return { ...res, data: res.data.map(withDroppedValues) }
}

/** Used to update local query cache */
export const setSetsQueryData = (data: SetsList) =>
  queryClient.setQueryData([queryKeys.sets], data)

export const useSetsQuery = () =>
  useQuery({
    queryKey: [queryKeys.sets],
    queryFn: fetchSets,
  })
