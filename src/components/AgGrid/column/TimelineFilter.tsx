import { useCallback } from 'react'

import type { IDoesFilterPassParams } from 'ag-grid-community'
import { type CustomFilterProps, useGridFilter } from 'ag-grid-react'
import { TimelineField } from 'components/Timeline'
import { useTimeline } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { TimelineId } from 'types/timeline'

const useTimelineFilterStyles = makeStyles({ name: 'TimelineFilter' })(
  (theme) => ({
    filter: {
      maxHeight: 480,
      overflow: 'auto',
      padding: theme.spacing(1),
      width: 680,
    },
  })
)

type AppearingItem = { effectiveAppearances: TimelineId[] }

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

  return (
    <TimelineField
      className={classes.filter}
      label="Filter timeline"
      onChange={(ids) => onModelChange(ids.length ? ids : null)}
      value={model ?? []}
    />
  )
}

export default TimelineFilter
