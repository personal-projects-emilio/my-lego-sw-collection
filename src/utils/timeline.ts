import type { VocabularyState } from 'types/common'
import type {
  InheritedTimeline,
  Kind,
  TimelineEntry,
  TimelineId,
  TimelineList,
} from 'types/timeline'

import { uniqueId } from './tags'
import { buildTree, byLabel } from './tree'
import { withoutUndefined } from './typescript'

export const kinds: Kind[] = ['movie', 'show', 'game', 'book', 'other']

export const isKind = (value: string): value is Kind =>
  kinds.some((kind) => kind === value)

export const kindName = (kind: Kind) => kind[0].toUpperCase() + kind.slice(1)

type Range = { start?: number; end?: number }

export type Role = 'era' | 'trilogy' | 'title'

export const roleOf = ({ parent, kind }: TimelineEntry): Role =>
  kind ? 'title' : parent ? 'trilogy' : 'era'

type Children = Map<TimelineId | undefined, TimelineEntry[]>

const childrenByParent = (timelineList: TimelineList) => {
  const children: Children = new Map()
  timelineList.forEach((entry) =>
    children.set(entry.parent, [...(children.get(entry.parent) ?? []), entry])
  )
  return children
}

const rangesById = ({
  timelineList,
  children,
}: {
  timelineList: TimelineList
  children: Children
}) => {
  const ranges = new Map<TimelineId, Range>()
  const rangeOf = ({
    entry,
    seen,
  }: {
    entry: TimelineEntry
    seen: Set<TimelineId>
  }): Range => {
    const known = ranges.get(entry.id)
    if (known) return known
    if (seen.has(entry.id)) return {}
    seen.add(entry.id)
    const inner = (children.get(entry.id) ?? []).map((child) =>
      rangeOf({ entry: child, seen })
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
  timelineList.forEach((entry) => rangeOf({ entry, seen: new Set() }))
  return ranges
}

const createTimeline = (timelineList: TimelineList) => {
  const children = childrenByParent(timelineList)
  const ranges = rangesById({ timelineList, children })
  const range = (id: TimelineId) => ranges.get(id) ?? {}
  const byDate = (a: TimelineEntry, b: TimelineEntry) =>
    (range(a.id).start ?? Infinity) - (range(b.id).start ?? Infinity) ||
    (range(a.id).end ?? Infinity) - (range(b.id).end ?? Infinity) ||
    byLabel(a, b)
  const tree = buildTree({ nodes: timelineList, compare: byDate })
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
    tree.sort((children.get(id) ?? []).map((entry) => entry.id))

  const holdsTrilogies = (id: TimelineId) =>
    (children.get(id) ?? []).some((child) => roleOf(child) === 'trilogy')

  const sorted = tree
    .sort(timelineList.map(({ id }) => id))
    .flatMap((id) => byId.get(id) ?? [])

  const eraOf = (id: TimelineId) => {
    const root = tree.rootOf(id)
    return root && roleOf(root) === 'era' ? root : undefined
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

  const withRole = (role: Role) =>
    sorted.filter((entry) => roleOf(entry) === role)
  const eras = withRole('era')
  const titles = withRole('title')

  return {
    ...tree,
    entry: (id: TimelineId) => byId.get(id),
    has,
    range,
    withImplied,
    pathLabel,
    groupedLabel,
    childrenOf,
    holdsTrilogies,
    eraOf,
    entries: sorted,
    eras,
    erasWithTitles: eras.filter((era) =>
      titles.some(({ id }) => eraOf(id) === era)
    ),
    trilogies: withRole('trilogy'),
    titles,
  }
}

export type Timeline = ReturnType<typeof createTimeline>

const mapTimelineListsToTimelines = new WeakMap<TimelineList, Timeline>()

export const buildTimeline = (timelineList: TimelineList) => {
  const cached = mapTimelineListsToTimelines.get(timelineList)
  if (cached) return cached
  const timeline = createTimeline(timelineList)
  mapTimelineListsToTimelines.set(timelineList, timeline)
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

export type TimelineState = VocabularyState<'timelineList', TimelineEntry>

export type TimelineEdit = { state: TimelineState } | { refused: string }

export type EntryDraft = Omit<TimelineEntry, 'id'> & { id?: TimelineId }

export const saveEntry = ({
  state,
  draft,
}: {
  state: TimelineState
  draft: EntryDraft
}): TimelineEdit => {
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
  if (!kind && parentEntry && id && timeline.holdsTrilogies(id))
    return { refused: `${label} holds trilogies, so it must stay an era` }
  if (kind && id && timeline.childrenOf(id).length)
    return { refused: `${label} has entries under it, so it can't be a title` }
  if (
    id &&
    parent &&
    (parent === id || timeline.ancestors(parent).some((a) => a.id === id))
  )
    return { refused: `${label} can't move under itself` }
  if (
    [start, end].some((year) => year !== undefined && !Number.isInteger(year))
  )
    return { refused: 'Years are whole numbers' }
  if (start === undefined && end !== undefined)
    return { refused: 'An end needs a start' }
  if (start !== undefined && end !== undefined && end < start)
    return { refused: 'The end comes before the start' }
  const existing = id !== undefined && timeline.has(id)
  const entry: TimelineEntry = withoutUndefined({
    ...draft,
    id: existing ? id : uniqueId({ list: state.timelineList, label }),
    label,
  })
  return {
    state: {
      ...state,
      timelineList: existing
        ? state.timelineList.map((e) => (e.id === id ? entry : e))
        : [...state.timelineList, entry],
    },
  }
}

type WithTimeline = { timeline?: TimelineId[] }

const withoutTimelineEntry = <Item extends WithTimeline>({
  items,
  id,
}: {
  items: Item[]
  id: TimelineId
}) =>
  items.some((item) => item.timeline?.includes(id))
    ? items.map((item) =>
        item.timeline?.includes(id)
          ? { ...item, timeline: item.timeline.filter((a) => a !== id) }
          : item
      )
    : items

export const deleteEntry = ({
  state,
  id,
}: {
  state: TimelineState
  id: TimelineId
}): TimelineEdit => {
  const entry = state.timelineList.find((e) => e.id === id)
  if (!entry) return { refused: `Unknown entry ${id}` }
  return {
    state: {
      timelineList: state.timelineList.flatMap((e) =>
        e.id === id
          ? []
          : e.parent === id
            ? [withoutUndefined({ ...e, parent: entry.parent })]
            : [e]
      ),
      setsList: withoutTimelineEntry({ items: state.setsList, id }),
      minifigsList: withoutTimelineEntry({ items: state.minifigsList, id }),
    },
  }
}

export type PickStatus = 'none' | 'picked' | 'implied' | 'inherited'

export type Picks = {
  value: TimelineId[]
  inherited: InheritedTimeline
}

type PickTarget = { timeline: Timeline; picks: Picks; id: TimelineId }

const isUnder = ({
  timeline,
  id,
  ancestor,
}: {
  timeline: Timeline
  id: TimelineId
  ancestor: TimelineId
}) => timeline.ancestors(id).some((entry) => entry.id === ancestor)

export const pickStatus = ({
  timeline,
  picks: { value, inherited },
  id,
}: PickTarget): PickStatus =>
  inherited[id]
    ? 'inherited'
    : value.includes(id)
      ? 'picked'
      : [...value, ...Object.keys(inherited)].some((other) =>
            isUnder({ timeline, id: other, ancestor: id })
          )
        ? 'implied'
        : 'none'

export const togglePick = ({ timeline, picks, id }: PickTarget) => {
  const { value } = picks
  const status = pickStatus({ timeline, picks, id })
  if (value.includes(id)) return value.filter((other) => other !== id)
  return status === 'none'
    ? timeline.leaves([...value, id])
    : status === 'implied'
      ? value.filter((other) => !isUnder({ timeline, id: other, ancestor: id }))
      : value
}

export const canToggle = ({ timeline, picks, id }: PickTarget) => {
  const status = pickStatus({ timeline, picks, id })
  if (status === 'inherited') return picks.value.includes(id)
  return (
    status !== 'implied' ||
    picks.value.some((other) => isUnder({ timeline, id: other, ancestor: id }))
  )
}
