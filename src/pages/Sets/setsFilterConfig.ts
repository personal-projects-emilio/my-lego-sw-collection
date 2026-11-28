import type { ItemsFilterConfig } from 'types/itemsFilter'
import type { CollectionSet } from 'types/sets'
import {
  toFilterOptions,
  toMinifigIdOption,
  toSetIdOption,
} from 'utils/itemsFilter'
import { isSetRetired } from 'utils/lego'

export const setsFilterConfig: ItemsFilterConfig<CollectionSet> = {
  getBooleanValues: {
    owned: ({ ownedQuantity }) => ownedQuantity > 0,
    retired: (set) => isSetRetired(set),
  },
  getListValues: {
    characterName: ({ content }) =>
      toFilterOptions(
        content.minifigs.map(({ characterName }) => characterName)
      ),
    minifigId: ({ content }) => content.minifigs.map(toMinifigIdOption),
    setId: (set) => [toSetIdOption(set)],
    subtheme: ({ subtheme }) => toFilterOptions([subtheme]),
    tags: ({ effectiveTags }) => toFilterOptions(effectiveTags),
    timeline: ({ effectiveTimeline }) => toFilterOptions(effectiveTimeline),
  },
  mapColumnIdsToFields: {
    'content.minifigs': 'minifigId',
    id: 'setId',
    ownedQuantity: 'owned',
    retired: 'retired',
    subtheme: 'subtheme',
    tags: 'tags',
    timeline: 'timeline',
  },
}
