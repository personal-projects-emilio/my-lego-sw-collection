import type { CustomCellRendererProps } from 'ag-grid-react'
import { useTimeline } from 'hooks'
import type { TimelineId, TimelineItem } from 'types/timeline'

import TreeCell from './TreeCell'

const TimelineCellRenderer = ({
  data,
  valueFormatted,
}: CustomCellRendererProps<TimelineItem, TimelineId[]>) => (
  <TreeCell
    ids={data?.effectiveTimeline ?? []}
    inherited={data?.inheritedTimeline}
    text={valueFormatted}
    tree={useTimeline()}
  />
)

export default TimelineCellRenderer
