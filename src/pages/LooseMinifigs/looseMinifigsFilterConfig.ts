import type { ItemsFilterConfig } from 'types/itemsFilter'
import type { CollectionMinifig } from 'types/minifigs'
import { toFilterOptions, toMinifigIdOption } from 'utils/itemsFilter'

export const looseMinifigsFilterConfig: ItemsFilterConfig<CollectionMinifig> = {
  getBooleanValues: {},
  getListValues: {
    characterName: ({ characterName }) => toFilterOptions([characterName]),
    minifigId: (minifig) => [toMinifigIdOption(minifig)],
  },
  mapColumnIdsToFields: { id: 'minifigId' },
}
