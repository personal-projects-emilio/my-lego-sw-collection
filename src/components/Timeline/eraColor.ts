import type { TimelineId } from 'types/timeline'
import type { Timeline } from 'utils/timeline'

const eraPalette = [
  '#ffab91',
  '#b0bec5',
  '#fff59d',
  '#a5d6a7',
  '#90caf9',
  '#bcaaa4',
  '#b39ddb',
  '#ef9a9a',
  '#80deea',
  '#f48fb1',
  '#80cbc4',
  '#e6ee9c',
  '#9fa8da',
]

const noEraColor = '#e0e0e0'

export const eraColor = (timeline: Timeline, id?: TimelineId) => {
  const era = id === undefined ? undefined : timeline.eraOf(id)
  const index = era ? timeline.eras.indexOf(era) : -1
  return index < 0 ? noEraColor : eraPalette[index % eraPalette.length]
}
