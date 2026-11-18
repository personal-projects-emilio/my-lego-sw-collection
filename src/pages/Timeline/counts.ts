import type { CollectionMinifigsList } from 'types/minifigs'
import type { CollectionSetsList } from 'types/sets'
import type { TimelineId } from 'types/timeline'

export type Counts = Map<TimelineId, { sets: number; minifigs: number }>

export const countItems = (
  setsList: CollectionSetsList = [],
  minifigsList: CollectionMinifigsList = []
): Counts => {
  const counts: Counts = new Map()
  const add = (ids: TimelineId[], key: 'sets' | 'minifigs') =>
    ids.forEach((id) => {
      const count = counts.get(id) ?? { sets: 0, minifigs: 0 }
      counts.set(id, { ...count, [key]: count[key] + 1 })
    })
  setsList.forEach(({ effectiveAppearances }) =>
    add(effectiveAppearances, 'sets')
  )
  minifigsList.forEach(({ effectiveAppearances }) =>
    add(effectiveAppearances, 'minifigs')
  )
  return counts
}

export const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

export const countLabel = (counts: Counts, id: TimelineId) => {
  const count = counts.get(id)
  return count
    ? `${plural(count.sets, 'set')} · ${plural(count.minifigs, 'minifig')}`
    : 'Not in collection'
}
