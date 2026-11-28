import type { ItemsFilterConfig } from 'types/itemsFilter'
import type { CollectionMinifig } from 'types/minifigs'
import { toFilterOptions } from 'utils/itemsFilter'

export const looseMinifigsFilterConfig: ItemsFilterConfig<CollectionMinifig> = {
  getBooleanValues: {},
  getListValues: {
    characterName: ({ characterName }) => toFilterOptions([characterName]),
    minifigId: ({ characterName, id }) => [
      { label: `${id} · ${characterName}`, value: id },
    ],
  },
  itemType: 'minifigs',
  mapColumnIdsToFields: { id: 'minifigId' },
}
