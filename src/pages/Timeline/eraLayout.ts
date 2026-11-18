import type { TimelineEntry } from 'types/timeline'

const pxPerYear = 14
const maxGap = 90

export type Spacing = 'ordinal' | 'proportional'

export type Side = 'left' | 'right'

export const sides: Side[] = ['left', 'right']

export type Row = {
  year?: number
  gap?: number
  compressed?: boolean
  empty?: boolean
}

export const sideOf = (entry: TimelineEntry): Side =>
  entry.kind === 'movie' ? 'left' : 'right'

export const eraLayout = ({
  titles,
  trilogies,
  spacing,
}: {
  titles: TimelineEntry[]
  trilogies: TimelineEntry[]
  spacing: Spacing
}) => {
  const years = [
    ...new Set(
      titles.flatMap(({ start }) => (start === undefined ? [] : [start]))
    ),
  ].sort((a, b) => a - b)
  const rows: Row[] = years.flatMap((year, index) => {
    const gap = index ? year - years[index - 1] - 1 : 0
    const spacer: Row[] =
      spacing === 'proportional' && gap > 0
        ? [
            {
              gap: Math.min(gap * pxPerYear, maxGap),
              compressed: gap * pxPerYear > maxGap,
            },
          ]
        : []
    return [...spacer, { year }]
  })
  if (titles.some(({ start }) => start === undefined)) rows.push({})
  const emptyTrilogies = trilogies.filter(
    (trilogy) => !titles.some(({ parent }) => parent === trilogy.id)
  )
  if (emptyTrilogies.length) rows.push({ empty: true })
  const rowOf = (entry: TimelineEntry) =>
    rows.findIndex(
      ({ year, gap, empty }) =>
        gap === undefined && !empty && year === entry.start
    ) + 2
  const brackets = trilogies.flatMap((trilogy) =>
    sides
      .flatMap((side) => {
        const children = titles.filter(
          (title) => title.parent === trilogy.id && sideOf(title) === side
        )
        if (!children.length) return []
        const childRows = children.map(rowOf)
        return [
          {
            trilogy,
            side,
            from: Math.min(...childRows),
            to: Math.max(...childRows),
          },
        ]
      })
      .map((bracket, index) => ({ ...bracket, duplicate: index > 0 }))
  )
  const cellOf = ({ row, side }: { row: Row; side: Side }) =>
    row.empty
      ? side === 'right'
        ? emptyTrilogies
        : []
      : titles.filter(
          (title) => title.start === row.year && sideOf(title) === side
        )
  return { rows, brackets, cellOf }
}
