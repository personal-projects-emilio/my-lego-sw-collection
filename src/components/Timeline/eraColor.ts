import type { TimelineId } from 'types/timeline'
import type { Timeline } from 'utils/timeline'

const eraPalette = [
  '#ef9a9a',
  '#ffcc80',
  '#fff59d',
  '#a5d6a7',
  '#80deea',
  '#90caf9',
  '#b39ddb',
  '#f48fb1',
  '#bcaaa4',
  '#c5e1a5',
  '#9fa8da',
  '#ffab91',
  '#b0bec5',
]

const noEraColor = '#e0e0e0'

export const eraColor = (timeline: Timeline, id?: TimelineId) => {
  const era = id === undefined ? undefined : timeline.eraOf(id)
  if (!era) return noEraColor
  const ordered = [
    ...timeline.erasWithTitles,
    ...timeline.eras.filter(
      (other) => !timeline.erasWithTitles.includes(other)
    ),
  ]
  return eraPalette[ordered.indexOf(era) % eraPalette.length]
}
