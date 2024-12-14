import { useMemo } from 'react'

import { useSetsQuery } from 'api/sets'

type SetsStatistics = {
  percentageOwned: number
  total: number
  owned: number
  totalBought: number
  totalStoreValue: number
  totalMarketValue: number
}

const useSetsStatistics = (): SetsStatistics => {
  const { data: setsList = [] } = useSetsQuery()

  return useMemo<SetsStatistics>(() => {
    const computedStatistics = setsList.reduce(
      (statistics, set) => {
        const { bought, marketValue, storeValue } = set.prices
        return {
          ...statistics,
          totalBought: statistics.totalBought + bought,
          totalMarketValue: statistics.totalMarketValue + marketValue,
          totalStoreValue: statistics.totalStoreValue + storeValue,
          ...(set.possessed && {
            owned: ++statistics.owned,
          }),
        }
      },
      {
        owned: 0,
        totalBought: 0,
        totalStoreValue: 0,
        totalMarketValue: 0,
      }
    )
    const total = setsList.length
    return {
      ...computedStatistics,
      total,
      percentageOwned: computedStatistics.owned / total,
    }
  }, [setsList])
}

export default useSetsStatistics
