import { useMemo } from 'react'

import { useCollection } from 'hooks'
import type { FilterOption, ListFilterField } from 'types/itemsFilter'
import { getFilterOptions, toFilterOptions } from 'utils/itemsFilter'

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
        getValues: ({ characterName, id }) => [
          { label: `${id} · ${characterName}`, value: id },
        ],
        items: minifigs,
      }),
      setId: getFilterOptions({
        getValues: ({ id, name }) => [
          { label: `${id} · ${name}`, value: String(id) },
        ],
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
