import type { ColDef } from 'ag-grid-community'
import { tagsDrawerButtonLabel } from 'components/TagsDrawer'
import type { TaggedItem, TagId, TagTarget } from 'types/tags'
import type { TagsVocabulary } from 'utils/tags'

import TagsFilter, { type TagsFilterProps } from './TagsFilter'
import TagsHeader from './TagsHeader'
import TagsTooltip from './TagsTooltip'

export const tagsColDef = <TData extends TaggedItem>({
  tagsVocabulary,
  itemType,
}: {
  tagsVocabulary: TagsVocabulary
  itemType: TagTarget
}): ColDef<TData, TagId[]> => ({
  colId: 'tags',
  comparator: (a, b) =>
    tagsVocabulary
      .groupedLabel(a ?? [])
      .localeCompare(tagsVocabulary.groupedLabel(b ?? [])),
  field: 'effectiveTags' as ColDef<TData, TagId[]>['field'],
  headerName: 'Tags',
  headerComponentParams: { innerHeaderComponent: TagsHeader },
  suppressHeaderKeyboardEvent: ({ event }) =>
    event.key === 'Tab' &&
    !event.shiftKey &&
    event.target instanceof HTMLElement &&
    !!event.target.querySelector(`[aria-label="${tagsDrawerButtonLabel}"]`),
  filter: TagsFilter,
  filterParams: { itemType } satisfies TagsFilterProps,
  flex: 2,
  getQuickFilterText: ({ value }) =>
    (value ?? []).map(tagsVocabulary.label).join(', '),
  minWidth: 160,
  suppressFloatingFilterButton: false,
  tooltip: ({ value }) => (value?.length ? value : undefined),
  tooltipComponent: TagsTooltip,
  valueFormatter: ({ value }) => tagsVocabulary.groupedLabel(value ?? []),
})
