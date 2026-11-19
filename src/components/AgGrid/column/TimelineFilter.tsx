import { useCallback, useRef, useState } from 'react'

import type { IDoesFilterPassParams } from 'ag-grid-community'
import { type CustomFilterProps, useGridFilter } from 'ag-grid-react'
import { TimelineField } from 'components/Timeline'
import { useTimeline } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { TimelineId, TimelineItem } from 'types/timeline'

const useTimelineFilterStyles = makeStyles({ name: 'TimelineFilter' })(
  (theme) => ({
    filter: {
      padding: theme.spacing(1),
      width: `min(680px, calc(100vw - ${theme.spacing(4)}))`,
    },
  })
)

const TimelineFilter = ({
  model,
  onModelChange,
}: CustomFilterProps<TimelineItem, unknown, TimelineId[]>) => {
  const { classes } = useTimelineFilterStyles()
  const timeline = useTimeline()
  const inputRef = useRef<HTMLInputElement>(null)
  const [shownCount, setShownCount] = useState(0)

  const doesFilterPass = useCallback(
    ({ data }: IDoesFilterPassParams<TimelineItem>) =>
      !model || model.some((id) => data.effectiveTimeline.includes(id)),
    [model]
  )
  const getModelAsString = useCallback(
    (current: TimelineId[] | null) =>
      (current ?? []).map(timeline.pathLabel).join(', '),
    [timeline]
  )
  const afterGuiAttached = useCallback(() => inputRef.current?.focus(), [])
  const afterGuiDetached = useCallback(
    () => setShownCount((count) => count + 1),
    []
  )
  useGridFilter({
    afterGuiAttached,
    afterGuiDetached,
    doesFilterPass,
    getModelAsString,
  })

  return (
    <TimelineField
      key={shownCount}
      className={classes.filter}
      inputRef={inputRef}
      label="Filter timeline"
      onChange={(ids) => onModelChange(ids.length ? ids : null)}
      popperClassName="ag-custom-component-popup"
      value={model ?? []}
    />
  )
}

export default TimelineFilter
