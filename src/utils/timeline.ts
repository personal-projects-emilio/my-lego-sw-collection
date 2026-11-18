import { isUndefined, omitBy } from 'lodash'
import type { MinifigsList } from 'types/minifigs'
import type { SetsList } from 'types/sets'
import type {
  Kind,
  TimelineEntry,
  TimelineId,
  TimelineList,
} from 'types/timeline'

import { uniqueId } from './tags'
import { buildTree, byLabel } from './tree'

export const kinds: Kind[] = ['movie', 'show', 'game', 'book', 'other']

export const kindName = (kind: Kind) => kind[0].toUpperCase() + kind.slice(1)

type Range = { start?: number; end?: number }

const spans = (timelineList: TimelineList) => {
  const children = new Map<TimelineId | undefined, TimelineEntry[]>()
  timelineList.forEach((entry) =>
    children.set(entry.parent, [...(children.get(entry.parent) ?? []), entry])
  )
  const ranges = new Map<TimelineId, Range>()
  const rangeOf = (entry: TimelineEntry, seen: Set<TimelineId>): Range => {
    const known = ranges.get(entry.id)
    if (known) return known
    if (seen.has(entry.id)) return {}
    seen.add(entry.id)
    const inner = (children.get(entry.id) ?? []).map((child) =>
      rangeOf(child, seen)
    )
    const starts = inner.flatMap(({ start }) => start ?? [])
    const ends = inner.flatMap(({ start, end }) => end ?? start ?? [])
    const range =
      entry.start !== undefined
        ? { start: entry.start, end: entry.end ?? entry.start }
        : starts.length
          ? { start: Math.min(...starts), end: Math.max(...ends) }
          : {}
    ranges.set(entry.id, range)
    return range
  }
  timelineList.forEach((entry) => rangeOf(entry, new Set()))
  return ranges
}

const createTimeline = (timelineList: TimelineList) => {
  const ranges = spans(timelineList)
  const range = (id: TimelineId) => ranges.get(id) ?? {}
  const byDate = (a: TimelineEntry, b: TimelineEntry) =>
    (range(a.id).start ?? Infinity) - (range(b.id).start ?? Infinity) ||
    (range(a.id).end ?? Infinity) - (range(b.id).end ?? Infinity) ||
    byLabel(a, b)
  const tree = buildTree(timelineList, byDate)
  const byId = new Map(timelineList.map((entry) => [entry.id, entry]))

  const has = (id: TimelineId) => byId.has(id)

  const withImplied = (ids: TimelineId[]) =>
    tree.sort(
      ids
        .filter(has)
        .flatMap((id) => [id, ...tree.ancestors(id).map((entry) => entry.id)])
    )

  const pathLabel = (id: TimelineId) =>
    [
      ...tree
        .ancestors(id)
        .reverse()
        .map(({ label }) => label),
      tree.label(id),
    ].join(' › ')

  const childrenOf = (id: TimelineId | undefined) =>
    tree.sort(
      timelineList
        .filter(({ parent }) => parent === id)
        .map((entry) => entry.id)
    )

  return {
    ...tree,
    entry: (id: TimelineId) => byId.get(id),
    has,
    range,
    withImplied,
    pathLabel,
    childrenOf,
    eraOf: (id: TimelineId) => tree.rootOf(id),
  }
}

export type Timeline = ReturnType<typeof createTimeline>

const timelines = new WeakMap<TimelineList, Timeline>()

export const buildTimeline = (timelineList: TimelineList) => {
  const cached = timelines.get(timelineList)
  if (cached) return cached
  const timeline = createTimeline(timelineList)
  timelines.set(timelineList, timeline)
  return timeline
}

export const formatYear = (year: number) =>
  year === 0 ? '0 BBY/ABY' : `${Math.abs(year)} ${year < 0 ? 'BBY' : 'ABY'}`

export const formatRange = ({ start, end }: Range) =>
  start === undefined
    ? 'Undated'
    : end === undefined || end === start
      ? formatYear(start)
      : `${formatYear(start)} – ${formatYear(end)}`

export type TimelineState = {
  timelineList: TimelineList
  setsList: SetsList
  minifigsList: MinifigsList
}

export type TimelineEdit = { state: TimelineState } | { refused: string }

export type EntryDraft = Omit<TimelineEntry, 'id'> & { id?: TimelineId }

export const saveEntry = (
  state: TimelineState,
  draft: EntryDraft
): TimelineEdit => {
  const label = draft.label.trim()
  if (!label) return { refused: 'An entry needs a label' }
  const timeline = buildTimeline(state.timelineList)
  const { id, parent, start, end } = draft
  if (parent && !timeline.has(parent))
    return { refused: `Unknown parent ${parent}` }
  if (
    id &&
    parent &&
    (parent === id || timeline.ancestors(parent).some((a) => a.id === id))
  )
    return { refused: `${label} can't move under itself` }
  if (start !== undefined && end !== undefined && end < start)
    return { refused: 'The end comes before the start' }
  const existing = id !== undefined && timeline.has(id)
  const entry = omitBy(
    {
      ...draft,
      id: existing ? id : uniqueId(state.timelineList, label),
      label,
    },
    isUndefined
  ) as TimelineEntry
  return {
    state: {
      ...state,
      timelineList: existing
        ? state.timelineList.map((e) => (e.id === id ? entry : e))
        : [...state.timelineList, entry],
    },
  }
}

type WithAppearances = { appearances?: TimelineId[] }

const withoutAppearance = <T extends WithAppearances>(
  items: T[],
  id: TimelineId
) =>
  items.some(({ appearances }) => appearances?.includes(id))
    ? items.map((item) =>
        item.appearances?.includes(id)
          ? { ...item, appearances: item.appearances.filter((a) => a !== id) }
          : item
      )
    : items

export const deleteEntry = (
  state: TimelineState,
  id: TimelineId
): TimelineEdit => {
  const entry = state.timelineList.find((e) => e.id === id)
  if (!entry) return { refused: `Unknown entry ${id}` }
  return {
    state: {
      timelineList: state.timelineList.flatMap((e) =>
        e.id === id
          ? []
          : e.parent === id
            ? [
                omitBy(
                  { ...e, parent: entry.parent },
                  isUndefined
                ) as TimelineEntry,
              ]
            : [e]
      ),
      setsList: withoutAppearance(state.setsList, id),
      minifigsList: withoutAppearance(state.minifigsList, id),
    },
  }
}
