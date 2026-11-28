import type { ItemsFilterConfig } from 'types/itemsFilter'
import type { ResaleSet } from 'types/resale'
import { toSetIdOption } from 'utils/itemsFilter'
import { isSetRetired } from 'utils/lego'

export const resaleSetsFilterConfig: ItemsFilterConfig<ResaleSet> = {
  getBooleanValues: { retired: (resaleSet) => isSetRetired(resaleSet) },
  getListValues: {
    setId: (resaleSet) => [toSetIdOption(resaleSet)],
  },
  mapColumnIdsToFields: {
    id: 'setId',
    retired: 'retired',
  },
}
