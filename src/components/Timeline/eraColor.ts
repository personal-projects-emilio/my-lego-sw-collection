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

const mapTimelinesToEraColors = new WeakMap<Timeline, Map<TimelineId, string>>()

const colorsOf = (timeline: Timeline) => {
  const known = mapTimelinesToEraColors.get(timeline)
  if (known) return known
  const withTitles = new Set(timeline.erasWithTitles)
  const colors = new Map(
    [
      ...timeline.erasWithTitles,
      ...timeline.eras.filter((era) => !withTitles.has(era)),
    ].map((era, index) => [era.id, eraPalette[index % eraPalette.length]])
  )
  mapTimelinesToEraColors.set(timeline, colors)
  return colors
}

export const eraColor = ({
  timeline,
  id,
}: {
  timeline: Timeline
  id?: TimelineId
}) => {
  const era = id === undefined ? undefined : timeline.eraOf(id)
  return (era && colorsOf(timeline).get(era.id)) ?? noEraColor
}
