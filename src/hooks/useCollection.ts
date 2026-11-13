import { useMemo } from 'react'

import { useLooseMinifigsQuery } from 'api/looseMinifigs'
import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { buildCollection } from 'utils/lego'

/** Sets and minifigs with their calculated values, recomputed whenever either query data changes */
const useCollection = () => {
  const { data: setsList, isLoading: isSetsLoading } = useSetsQuery()
  const { data: minifigsList, isLoading: isMinifigsLoading } =
    useMinifigsQuery()
  const { data: looseMinifigsList, isLoading: isLooseMinifigsLoading } =
    useLooseMinifigsQuery()

  const collection = useMemo(
    () =>
      setsList && minifigsList && looseMinifigsList
        ? buildCollection({ setsList, minifigsList, looseMinifigsList })
        : undefined,
    [setsList, minifigsList, looseMinifigsList]
  )

  return {
    ...collection,
    isLoading: isSetsLoading || isMinifigsLoading || isLooseMinifigsLoading,
  }
}

export default useCollection
