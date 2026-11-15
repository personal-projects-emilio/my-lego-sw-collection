import { useMemo } from 'react'

import { useMinifigsQuery } from 'api/minifigs'
import { uniqueAndSortedArray } from 'utils/array'

type MinifigsAutocompleteOptions = {
  characterNames: string[]
  ids: string[]
}

const useMinifigsAutocompleteOptions = () => {
  const { data: minifigsList = [] } = useMinifigsQuery()

  return useMemo<MinifigsAutocompleteOptions>(() => {
    const statistics = minifigsList.reduce<MinifigsAutocompleteOptions>(
      (acc, minifig) => {
        return {
          characterNames: [...acc.characterNames, minifig.characterName],
          ids: [...acc.ids, minifig.id],
        }
      },
      {
        characterNames: [],
        ids: [],
      }
    )
    return {
      characterNames: uniqueAndSortedArray(statistics.characterNames),
      ids: statistics.ids,
    }
  }, [minifigsList])
}

export default useMinifigsAutocompleteOptions
