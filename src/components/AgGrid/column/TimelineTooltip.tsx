import type { CustomTooltipProps } from 'ag-grid-react'
import TreeView from 'components/TreeView'
import { useTimeline } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { AppearingItem } from 'types/timeline'
import { inheritedFrom } from 'utils/tags'

const useTimelineTooltipStyles = makeStyles({ name: 'TimelineTooltip' })({
  tooltip: {
    backgroundColor: 'var(--ag-tooltip-background-color)',
    border: 'var(--ag-tooltip-border)',
    borderRadius: 'var(--ag-border-radius)',
    color: 'var(--ag-tooltip-text-color)',
    maxWidth: 420,
    padding:
      'var(--ag-widget-container-vertical-padding) var(--ag-widget-container-horizontal-padding)',
  },
})

const TimelineTooltip = ({ data }: CustomTooltipProps<AppearingItem>) => {
  const { classes } = useTimelineTooltipStyles()
  const timeline = useTimeline()
  if (!data?.effectiveAppearances.length) return null

  const notes = Object.fromEntries(
    Object.entries(data.inheritedAppearances ?? {}).map(([id, sources]) => [
      id,
      inheritedFrom(sources),
    ])
  )

  return (
    <TreeView
      className={classes.tooltip}
      ids={data.effectiveAppearances}
      notes={notes}
      tree={timeline}
    />
  )
}

export default TimelineTooltip
