import { isUndefined, omitBy } from 'lodash'
import type { MinifigsList } from 'types/minifigs'
import type { SetsList } from 'types/sets'
import type {
  InheritedAppearances,
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

  const sorted = tree
    .sort(timelineList.map(({ id }) => id))
    .flatMap((id) => byId.get(id) ?? [])

  const eraOf = (id: TimelineId) => {
    const root = tree.rootOf(id)
    return root && !root.kind ? root : undefined
  }

  const groupedLabel = (ids: TimelineId[]) => {
    const groups = new Map<TimelineId, TimelineId[]>()
    tree.leaves(ids.filter(has)).forEach((id) => {
      const key = byId.get(id)?.parent ?? id
      groups.set(key, [...(groups.get(key) ?? []), id])
    })
    return [...groups]
      .map(([key, members]) =>
        members.length > 1
          ? `${pathLabel(key)} › ${members.map(tree.label).join(', ')}`
          : pathLabel(members[0])
      )
      .join(' | ')
  }

  const eras = sorted.filter(({ parent, kind }) => !parent && !kind)
  const titles = sorted.filter(({ kind }) => kind)

  return {
    ...tree,
    entry: (id: TimelineId) => byId.get(id),
    has,
    range,
    withImplied,
    pathLabel,
    groupedLabel,
    childrenOf,
    eraOf,
    eras,
    erasWithTitles: eras.filter((era) =>
      titles.some(({ id }) => eraOf(id) === era)
    ),
    trilogies: sorted.filter(({ parent, kind }) => parent && !kind),
    titles,
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
  const { id, parent, kind, start, end } = draft
  const parentEntry = parent ? timeline.entry(parent) : undefined
  if (parent && !parentEntry) return { refused: `Unknown parent ${parent}` }
  if (parentEntry?.kind)
    return { refused: `${parentEntry.label} is a title and can't hold entries` }
  if (!kind && parentEntry?.parent)
    return { refused: 'A trilogy goes directly under an era' }
  if (kind && id && timeline.childrenOf(id).length)
    return { refused: `${label} has entries under it, so it can't be a title` }
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

export type PickStatus = 'none' | 'picked' | 'implied' | 'inherited'

export type Picks = {
  value: TimelineId[]
  inherited: InheritedAppearances
}

const isUnder = (timeline: Timeline, id: TimelineId, ancestor: TimelineId) =>
  timeline.ancestors(id).some((entry) => entry.id === ancestor)

export const pickStatus = (
  timeline: Timeline,
  { value, inherited }: Picks,
  id: TimelineId
): PickStatus =>
  inherited[id]
    ? 'inherited'
    : value.includes(id)
      ? 'picked'
      : [...value, ...Object.keys(inherited)].some((other) =>
            isUnder(timeline, other, id)
          )
        ? 'implied'
        : 'none'

export const togglePick = (
  timeline: Timeline,
  picks: Picks,
  id: TimelineId
) => {
  const { value } = picks
  const status = pickStatus(timeline, picks, id)
  return status === 'none'
    ? timeline.leaves([...value, id])
    : status === 'picked'
      ? value.filter((other) => other !== id)
      : status === 'implied'
        ? value.filter((other) => !isUnder(timeline, other, id))
        : value
}

export const canToggle = (timeline: Timeline, picks: Picks, id: TimelineId) => {
  const status = pickStatus(timeline, picks, id)
  return (
    status !== 'inherited' &&
    (status !== 'implied' ||
      picks.value.some((other) => isUnder(timeline, other, id)))
  )
}
