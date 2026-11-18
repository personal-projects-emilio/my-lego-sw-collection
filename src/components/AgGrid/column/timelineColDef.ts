import type { ColDef } from 'ag-grid-community'
import type { AppearingItem, TimelineId } from 'types/timeline'
import type { Timeline } from 'utils/timeline'

import TimelineFilter from './TimelineFilter'
import TimelineTooltip from './TimelineTooltip'

export const timelineColDef = <TData extends AppearingItem>(
  timeline: Timeline
): ColDef<TData, TimelineId[]> => {
  const order = new Map(timeline.entries.map(({ id }, index) => [id, index]))
  const ranks = new WeakMap<TimelineId[], number[]>()
  const noIds: TimelineId[] = []
  const rank = (ids: TimelineId[] | null | undefined) => {
    const list = ids ?? noIds
    const known = ranks.get(list)
    if (known) return known
    const computed = timeline
      .leaves(list)
      .map((id) => order.get(id) ?? Infinity)
    ranks.set(list, computed)
    return computed
  }
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
