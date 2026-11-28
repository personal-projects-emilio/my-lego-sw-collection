import type { ItemsFilterConfig } from 'types/itemsFilter'
import type { ResaleSet } from 'types/resale'
import { isSetRetired } from 'utils/lego'

export const resaleSetsFilterConfig: ItemsFilterConfig<ResaleSet> = {
  getBooleanValues: { retired: (resaleSet) => isSetRetired(resaleSet) },
  getListValues: {
    setId: ({ id, name }) => [{ label: `${id} · ${name}`, value: String(id) }],
  },
  mapColumnIdsToFields: {
    id: 'setId',
    retired: 'retired',
  },
}
