import { useMemo } from 'react'

import { useSetsQuery } from 'api/sets'
import { uniqueAndSortedArray } from 'utils/array'

type SetsAutocompleteOptions = {
  ids: Array<string | number>
  subthemes: string[]
}

const useSetsAutocompleteOptions = () => {
  const { data: setsList = [] } = useSetsQuery()

  return useMemo<SetsAutocompleteOptions>(() => {
    const statistics = setsList.reduce<SetsAutocompleteOptions>(
      (acc, set) => {
        return {
          ids: [...acc.ids, set.id],
          subthemes: [...acc.subthemes, set.subtheme],
        }
      },
      {
        ids: [],
        subthemes: [],
      }
    )
    return {
      ids: statistics.ids,
      subthemes: uniqueAndSortedArray(statistics.subthemes),
    }
  }, [setsList])
}

export default useSetsAutocompleteOptions
