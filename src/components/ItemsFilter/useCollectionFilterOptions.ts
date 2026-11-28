import { useMemo } from 'react'

import { useCollection } from 'hooks'
import type { FilterOption, ListFilterField } from 'types/itemsFilter'
import {
  getFilterOptions,
  toFilterOptions,
  toMinifigIdOption,
  toSetIdOption,
} from 'utils/itemsFilter'

const useCollectionFilterOptions = () => {
  const { minifigsList, setsList } = useCollection()

  return useMemo((): Partial<Record<ListFilterField, FilterOption[]>> => {
    const sets = setsList ?? []
    const minifigs = minifigsList ?? []
    return {
      characterName: getFilterOptions({
        getValues: ({ characterName }) => toFilterOptions([characterName]),
        items: minifigs,
      }),
      minifigId: getFilterOptions({
        getValues: (minifig) => [toMinifigIdOption(minifig)],
        items: minifigs,
      }),
      setId: getFilterOptions({
        getValues: (set) => [toSetIdOption(set)],
        items: sets,
      }),
      subtheme: getFilterOptions({
        getValues: ({ subtheme }) => toFilterOptions([subtheme]),
        items: sets,
      }),
    }
  }, [minifigsList, setsList])
}

export default useCollectionFilterOptions
