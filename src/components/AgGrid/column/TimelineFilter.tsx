import { useCallback } from 'react'

import type { IDoesFilterPassParams } from 'ag-grid-community'
import { type CustomFilterProps, useGridFilter } from 'ag-grid-react'
import { TimelinePicker } from 'components/Timeline'
import { useTimeline } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { TimelineId } from 'types/timeline'
import { togglePick } from 'utils/timeline'

const useTimelineFilterStyles = makeStyles({ name: 'TimelineFilter' })(
  (theme) => ({
    filter: {
      maxHeight: 480,
      overflow: 'auto',
      padding: theme.spacing(1.5),
      width: 480,
    },
  })
)

type AppearingItem = { effectiveAppearances: TimelineId[] }

const noInherited = {}

const TimelineFilter = ({
  model,
  onModelChange,
}: CustomFilterProps<AppearingItem, unknown, TimelineId[]>) => {
  const { classes } = useTimelineFilterStyles()
  const timeline = useTimeline()

  const doesFilterPass = useCallback(
    ({ data }: IDoesFilterPassParams<AppearingItem>) =>
      !model || model.some((id) => data.effectiveAppearances.includes(id)),
    [model]
  )
  const getModelAsString = useCallback(
    (current: TimelineId[] | null) =>
      (current ?? []).map(timeline.pathLabel).join(', '),
    [timeline]
  )
  useGridFilter({ doesFilterPass, getModelAsString })

  const picks = { value: model ?? [], inherited: noInherited }

  return (
    <div
      className={classes.filter}
      role="group"
      aria-label="Filter by timeline"
    >
      <TimelinePicker
        timeline={timeline}
        picks={picks}
        onToggle={(id) => {
          const next = togglePick(timeline, picks, id)
          onModelChange(next.length ? next : null)
        }}
      />
    </div>
  )
}

export default TimelineFilter
