import type { CustomTooltipProps } from 'ag-grid-react'
import { useTimeline } from 'hooks'
import type { TimelineItem } from 'types/timeline'

import TreeTooltip from './TreeTooltip'

const TimelineTooltip = ({ data }: CustomTooltipProps<TimelineItem>) => (
  <TreeTooltip
    ids={data?.effectiveTimeline ?? []}
    inherited={data?.inheritedTimeline}
    tree={useTimeline()}
  />
)

export default TimelineTooltip
