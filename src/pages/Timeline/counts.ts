import type { CollectionMinifigsList } from 'types/minifigs'
import type { CollectionSetsList } from 'types/sets'
import type { TimelineId } from 'types/timeline'

export type Counts = Map<TimelineId, { sets: number; minifigs: number }>

export const countItems = ({
  setsList = [],
  minifigsList = [],
}: {
  setsList?: CollectionSetsList
  minifigsList?: CollectionMinifigsList
}): Counts => {
  const counts: Counts = new Map()
  const add = ({ ids, key }: { ids: TimelineId[]; key: 'sets' | 'minifigs' }) =>
    ids.forEach((id) => {
      const count = counts.get(id) ?? { sets: 0, minifigs: 0 }
      counts.set(id, { ...count, [key]: count[key] + 1 })
    })
  setsList.forEach(({ effectiveTimeline }) =>
    add({ ids: effectiveTimeline, key: 'sets' })
  )
  minifigsList.forEach(({ effectiveTimeline }) =>
    add({ ids: effectiveTimeline, key: 'minifigs' })
  )
  return counts
}

export const pluralize = ({ count, noun }: { count: number; noun: string }) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

export const countLabel = ({
  counts,
  id,
}: {
  counts: Counts
  id: TimelineId
}) => {
  const count = counts.get(id)
  return count
    ? `${pluralize({ count: count.sets, noun: 'set' })} · ${pluralize({ count: count.minifigs, noun: 'minifig' })}`
    : 'Not in collection'
}
