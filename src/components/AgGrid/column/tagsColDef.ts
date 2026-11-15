import type { ColDef } from 'ag-grid-community'
import type { TagTarget } from 'types/tags'
import type { Vocabulary } from 'utils/tags'

import OverflowTypographyCellRenderer from './OverflowTypographyCellRenderer'
import TagsFilter, { type TagsFilterProps } from './TagsFilter'

export const tagsColDef = <TData extends { effectiveTags: string[] }>(
  vocabulary: Vocabulary,
  itemType: TagTarget
): ColDef<TData, string[]> => ({
  colId: 'tags',
  field: 'effectiveTags' as ColDef<TData, string[]>['field'],
  headerName: 'Tags',
  cellRenderer: OverflowTypographyCellRenderer,
  filter: TagsFilter,
  filterParams: { itemType } satisfies TagsFilterProps,
  flex: 2,
  getQuickFilterText: ({ value }) =>
    (value ?? []).map(vocabulary.label).join(', '),
  minWidth: 160,
  suppressFloatingFilterButton: false,
  valueFormatter: ({ value }) => (value ?? []).map(vocabulary.label).join(', '),
})
