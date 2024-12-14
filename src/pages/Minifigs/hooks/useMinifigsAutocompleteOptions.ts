import { useMemo } from 'react'

import { useMinifigsQuery } from 'api/minifigs'
import { uniqueAndSortedArray } from 'utils/array'

type MinifigsAutocompleteOptions = {
  appearances: string[]
  characterNames: string[]
  ids: string[]
  tags: string[]
  timelines: string[]
}

const useMinifigsAutocompleteOptions = () => {
  const { data: minifigsList = [] } = useMinifigsQuery()

  return useMemo<MinifigsAutocompleteOptions>(() => {
    const statistics = minifigsList.reduce<MinifigsAutocompleteOptions>(
      (acc, minifig) => {
        return {
          appearances: [...acc.appearances, ...(minifig.appearances ?? [])],
          characterNames: [...acc.characterNames, minifig.characterName],
          ids: [...acc.ids, minifig.id],
          tags: [...acc.tags, ...(minifig.tags ?? [])],
          timelines: [...acc.timelines, ...(minifig.timelines ?? [])],
        }
      },
      {
        appearances: [],
        characterNames: [],
        ids: [],
        tags: [],
        timelines: [],
      }
    )
    return {
      appearances: uniqueAndSortedArray(statistics.appearances),
      characterNames: uniqueAndSortedArray(statistics.characterNames),
      ids: statistics.ids,
      tags: uniqueAndSortedArray(statistics.tags),
      timelines: uniqueAndSortedArray(statistics.timelines),
    }
  }, [minifigsList])
}

export default useMinifigsAutocompleteOptions
