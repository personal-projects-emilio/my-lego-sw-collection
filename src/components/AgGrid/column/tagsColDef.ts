import type { ColDef } from 'ag-grid-community'
import type { TagTarget } from 'types/tags'
import type { TagsVocabulary } from 'utils/tags'

import TagsFilter, { type TagsFilterProps } from './TagsFilter'
import TagsTooltip from './TagsTooltip'

export const tagsColDef = <TData extends { effectiveTags: string[] }>(
  vocabulary: TagsVocabulary,
  itemType: TagTarget
): ColDef<TData, string[]> => ({
  colId: 'tags',
  field: 'effectiveTags' as ColDef<TData, string[]>['field'],
  headerName: 'Tags',
  filter: TagsFilter,
  filterParams: { itemType } satisfies TagsFilterProps,
  flex: 2,
  getQuickFilterText: ({ value }) =>
    (value ?? []).map(vocabulary.label).join(', '),
  minWidth: 160,
  suppressFloatingFilterButton: false,
  tooltip: ({ value }) => (value?.length ? value : undefined),
  tooltipComponent: TagsTooltip,
  valueFormatter: ({ value }) => vocabulary.groupedLabel(value ?? []),
})
