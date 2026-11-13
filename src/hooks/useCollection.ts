import { useMemo } from 'react'

import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { buildCollection } from 'utils/lego'

/** Sets and minifigs with their calculated values, recomputed whenever either query data changes */
const useCollection = () => {
  const { data: setsList, isLoading: isSetsLoading } = useSetsQuery()
  const { data: minifigsList, isLoading: isMinifigsLoading } =
    useMinifigsQuery()

  const collection = useMemo(
    () =>
      setsList && minifigsList
        ? buildCollection({ setsList, minifigsList })
        : undefined,
    [setsList, minifigsList]
  )

  return { ...collection, isLoading: isSetsLoading || isMinifigsLoading }
}

export default useCollection
