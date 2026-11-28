import type { ItemsFilterConfig } from 'types/itemsFilter'
import type { ResaleSet } from 'types/resale'
import { toFilterOptions } from 'utils/itemsFilter'
import { isSetRetired } from 'utils/lego'

export const resaleSetsFilterConfig: ItemsFilterConfig<ResaleSet> = {
  getBooleanValues: { retired: (resaleSet) => isSetRetired(resaleSet) },
  getListValues: {
    location: ({ location }) => toFilterOptions(location ? [location] : []),
    setId: ({ id, name }) => [{ label: `${id} · ${name}`, value: String(id) }],
  },
  itemType: 'sets',
  mapColumnIdsToFields: {
    id: 'setId',
    location: 'location',
    retired: 'retired',
  },
}
