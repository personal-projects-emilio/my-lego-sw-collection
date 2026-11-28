import { useMemo } from 'react'

import { useCollection } from 'hooks'
import type { FilterOption, ItemsFilterConfig } from 'types/itemsFilter'
import type { CollectionMinifig } from 'types/minifigs'
import { toFilterOptions } from 'utils/itemsFilter'

const useMinifigsFilterConfig = (): ItemsFilterConfig<CollectionMinifig> => {
  const { setsList } = useCollection()

  return useMemo(() => {
    const mapMinifigIdsToSets = new Map<string, FilterOption[]>()
    for (const { content, id, name } of setsList ?? [])
      for (const minifig of content.minifigs)
        mapMinifigIdsToSets.set(minifig.id, [
          ...(mapMinifigIdsToSets.get(minifig.id) ?? []),
          { label: `${id} · ${name}`, value: String(id) },
        ])

    return {
      getBooleanValues: { owned: ({ owned }) => owned.total > 0 },
      getListValues: {
        characterName: ({ characterName }) => toFilterOptions([characterName]),
        minifigId: ({ characterName, id }) => [
          { label: `${id} · ${characterName}`, value: id },
        ],
        setId: ({ id }) => mapMinifigIdsToSets.get(id) ?? [],
        tags: ({ effectiveTags }) => toFilterOptions(effectiveTags),
        timeline: ({ effectiveTimeline }) => toFilterOptions(effectiveTimeline),
      },
      itemType: 'minifigs',
      mapColumnIdsToFields: {
        characterName: 'characterName',
        id: 'minifigId',
        owned: 'owned',
        tags: 'tags',
        timeline: 'timeline',
      },
    }
  }, [setsList])
}

export default useMinifigsFilterConfig
