import { useMemo } from 'react'

import { useCollection } from 'hooks'

type MinifigsStatistics = {
  totalOwned: number
  percentageVariantsOwned: number
  totalVariants: number
  variantsOwned: number
}

const useMinifigsStatistics = (): MinifigsStatistics => {
  const { minifigsList = [] } = useCollection()

  return useMemo<MinifigsStatistics>(() => {
    const computedStatistics = minifigsList.reduce(
      (statistics, minifig) => {
        return {
          ...statistics,
          totalOwned: statistics.totalOwned + minifig.owned.total,
          ...(minifig.possessed && {
            variantsOwned: ++statistics.variantsOwned,
          }),
        }
      },
      {
        totalOwned: 0,
        variantsOwned: 0,
      }
    )
    const totalVariants = minifigsList.length
    return {
      ...computedStatistics,
      totalVariants,
      percentageVariantsOwned: computedStatistics.variantsOwned / totalVariants,
    }
  }, [minifigsList])
}

export default useMinifigsStatistics
