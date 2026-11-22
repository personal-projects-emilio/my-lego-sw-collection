import type { ColDef } from 'ag-grid-community'
import { TagsDrawerButton } from 'components/TagsDrawer'
import type { TaggedItem, TagId, TagTarget } from 'types/tags'
import type { TagsVocabulary } from 'utils/tags'

import type { ColumnHeaderParams } from '../header'
import TagsCellRenderer from './TagsCellRenderer'
import TagsFilter, { type TagsFilterProps } from './TagsFilter'

export const buildTagsColDef = <TData extends TaggedItem>({
  tagsVocabulary,
  itemType,
}: {
  tagsVocabulary: TagsVocabulary
  itemType: TagTarget
}): ColDef<TData, TagId[]> => ({
  cellRenderer: TagsCellRenderer,
  colId: 'tags',
  comparator: (a, b) =>
    tagsVocabulary
      .getGroupedLabel(a ?? [])
      .localeCompare(tagsVocabulary.getGroupedLabel(b ?? [])),
  valueGetter: ({ data }) => data?.effectiveTags,
  headerName: 'Tags',
  headerComponentParams: {
    labelAdornment: TagsDrawerButton,
  } satisfies ColumnHeaderParams,
  filter: TagsFilter,
  filterParams: { itemType } satisfies TagsFilterProps,
  flex: 2,
  getQuickFilterText: ({ value }) =>
    (value ?? []).map(tagsVocabulary.getLabel).join(', '),
  minWidth: 160,
  suppressFloatingFilterButton: false,
  valueFormatter: ({ value }) => tagsVocabulary.getGroupedLabel(value ?? []),
})
