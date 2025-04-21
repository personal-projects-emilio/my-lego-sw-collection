import { useMemo } from 'react'

import { useSetsQuery } from 'api/sets'
import { uniqueAndSortedArray } from 'utils/array'

type SetsAutocompleteOptions = {
  appearances: string[]
  ids: Array<string | number>
  subthemes: string[]
  tags: string[]
  timelines: string[]
}

const useSetsAutocompleteOptions = () => {
  const { data: setsList = [] } = useSetsQuery()

  return useMemo<SetsAutocompleteOptions>(() => {
    const statistics = setsList.reduce<SetsAutocompleteOptions>(
      (acc, set) => {
        return {
          appearances: [...acc.appearances, ...(set.appearances ?? [])],
          ids: [...acc.ids, set.id],
          subthemes: [...acc.subthemes, set.subtheme],
          tags: [...acc.tags, ...(set.tags ?? [])],
          timelines: [...acc.timelines, ...(set.timelines ?? [])],
        }
      },
      {
        appearances: [],
        ids: [],
        subthemes: [],
        tags: [],
        timelines: [],
      }
    )
    return {
      appearances: uniqueAndSortedArray(statistics.appearances),
      ids: statistics.ids,
      subthemes: uniqueAndSortedArray(statistics.subthemes),
      tags: uniqueAndSortedArray(statistics.tags),
      timelines: uniqueAndSortedArray(statistics.timelines),
    }
  }, [setsList])
}

export default useSetsAutocompleteOptions
