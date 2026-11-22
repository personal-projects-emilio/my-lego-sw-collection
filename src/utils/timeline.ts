import type { VocabularyState } from 'types/common'
import type {
  InheritedTimeline,
  Kind,
  TimelineEntry,
  TimelineId,
  TimelineList,
} from 'types/timeline'

import { createUniqueId } from './tags'
import { buildTree, byLabel } from './tree'
import { removeUndefined } from './typescript'

export const kinds: Kind[] = ['movie', 'show', 'game', 'book', 'other']

export const isKind = (value: string): value is Kind =>
  kinds.some((kind) => kind === value)

export const getKindName = (kind: Kind) => kind[0].toUpperCase() + kind.slice(1)

type Range = { start?: number; end?: number }

export type Role = 'era' | 'trilogy' | 'title'

export const getRole = ({ parent, kind }: TimelineEntry): Role =>
  kind ? 'title' : parent ? 'trilogy' : 'era'

type Children = Map<TimelineId | undefined, TimelineEntry[]>

const groupChildrenByParent = (timelineList: TimelineList) => {
  const children: Children = new Map()
  timelineList.forEach((entry) =>
    children.set(entry.parent, [...(children.get(entry.parent) ?? []), entry])
  )
  return children
}

const buildRangesById = ({
  timelineList,
  children,
}: {
  timelineList: TimelineList
  children: Children
}) => {
  const ranges = new Map<TimelineId, Range>()
  const computeRange = ({
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
      computeRange({ entry: child, seen })
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
  timelineList.forEach((entry) => computeRange({ entry, seen: new Set() }))
  return ranges
}

const createTimeline = (timelineList: TimelineList) => {
  const children = groupChildrenByParent(timelineList)
  const ranges = buildRangesById({ timelineList, children })
  const getRange = (id: TimelineId) => ranges.get(id) ?? {}
  const byDate = (a: TimelineEntry, b: TimelineEntry) =>
    (getRange(a.id).start ?? Infinity) - (getRange(b.id).start ?? Infinity) ||
    (getRange(a.id).end ?? Infinity) - (getRange(b.id).end ?? Infinity) ||
    byLabel(a, b)
  const tree = buildTree({ nodes: timelineList, compare: byDate })
  const byId = new Map(timelineList.map((entry) => [entry.id, entry]))

  const has = (id: TimelineId) => byId.has(id)

  const addImplied = (ids: TimelineId[]) =>
    tree.sort(
      ids
        .filter(has)
        .flatMap((id) => [
          id,
          ...tree.getAncestors(id).map((entry) => entry.id),
        ])
    )

  const getPathLabel = (id: TimelineId) =>
    [
      ...tree
        .getAncestors(id)
        .reverse()
        .map(({ label }) => label),
      tree.getLabel(id),
    ].join(' › ')

  const getChildren = (id: TimelineId | undefined) =>
    tree.sort((children.get(id) ?? []).map((entry) => entry.id))

  const hasTrilogies = (id: TimelineId) =>
    (children.get(id) ?? []).some((child) => getRole(child) === 'trilogy')

  const sorted = tree
    .sort(timelineList.map(({ id }) => id))
    .flatMap((id) => byId.get(id) ?? [])

  const getEra = (id: TimelineId) => {
    const root = tree.getRoot(id)
    return root && getRole(root) === 'era' ? root : undefined
  }

  const getGroupedLabel = (ids: TimelineId[]) => {
    const groups = new Map<TimelineId, TimelineId[]>()
    tree.getLeaves(ids.filter(has)).forEach((id) => {
      const key = byId.get(id)?.parent ?? id
      groups.set(key, [...(groups.get(key) ?? []), id])
    })
    return [...groups]
      .map(([key, members]) =>
        members.length > 1
          ? `${getPathLabel(key)} › ${members.map(tree.getLabel).join(', ')}`
          : getPathLabel(members[0])
      )
      .join(' | ')
  }

  const filterByRole = (role: Role) =>
    sorted.filter((entry) => getRole(entry) === role)
  const eras = filterByRole('era')
  const titles = filterByRole('title')

  return {
    ...tree,
    entry: (id: TimelineId) => byId.get(id),
    has,
    getRange,
    addImplied,
    getPathLabel,
    getGroupedLabel,
    getChildren,
    hasTrilogies,
    getEra,
    entries: sorted,
    eras,
    erasWithTitles: eras.filter((era) =>
      titles.some(({ id }) => getEra(id) === era)
    ),
    trilogies: filterByRole('trilogy'),
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
  if (!kind && parentEntry && id && timeline.hasTrilogies(id))
    return { refused: `${label} holds trilogies, so it must stay an era` }
  if (kind && id && timeline.getChildren(id).length)
    return { refused: `${label} has entries under it, so it can't be a title` }
  if (
    id &&
    parent &&
    (parent === id || timeline.getAncestors(parent).some((a) => a.id === id))
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
  const entry: TimelineEntry = removeUndefined({
    ...draft,
    id: existing ? id : createUniqueId({ list: state.timelineList, label }),
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

const removeTimelineEntry = <Item extends WithTimeline>({
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
            ? [removeUndefined({ ...e, parent: entry.parent })]
            : [e]
      ),
      setsList: removeTimelineEntry({ items: state.setsList, id }),
      minifigsList: removeTimelineEntry({ items: state.minifigsList, id }),
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
}) => timeline.getAncestors(id).some((entry) => entry.id === ancestor)

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
    ? timeline.getLeaves([...value, id])
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
