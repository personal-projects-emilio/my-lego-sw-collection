import type { ColDef } from 'ag-grid-community'
import type { TimelineId } from 'types/timeline'
import type { Timeline } from 'utils/timeline'

import TimelineFilter from './TimelineFilter'
import TimelineTooltip from './TimelineTooltip'

type AppearingItem = { effectiveAppearances: TimelineId[] }

export const timelineColDef = <TData extends AppearingItem>(
  timeline: Timeline
): ColDef<TData, TimelineId[]> => {
  const order = new Map(timeline.entries.map(({ id }, index) => [id, index]))
  const rank = (ids: TimelineId[] | null | undefined) =>
    timeline.leaves(ids ?? []).map((id) => order.get(id) ?? Infinity)
  return {
    colId: 'timeline',
    comparator: (a, b) => {
      const left = rank(a)
      const right = rank(b)
      const index = left.findIndex((value, i) => value !== right[i])
      return index < 0
        ? left.length - right.length
        : (left[index] ?? -Infinity) - (right[index] ?? -Infinity)
    },
    field: 'effectiveAppearances' as ColDef<TData, TimelineId[]>['field'],
    headerName: 'Timeline',
    filter: TimelineFilter,
    flex: 2,
    getQuickFilterText: ({ value }) =>
      (value ?? []).map(timeline.label).join(', '),
    minWidth: 160,
    suppressFloatingFilterButton: false,
    tooltip: ({ value }) => (value?.length ? value : undefined),
    tooltipComponent: TimelineTooltip,
    valueFormatter: ({ value }) => timeline.groupedLabel(value ?? []),
  }
}
