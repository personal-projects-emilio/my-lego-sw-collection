import { useTimelineQuery } from 'api/timeline'
import type { TimelineList } from 'types/timeline'
import { buildTimeline } from 'utils/timeline'

const noEntries: TimelineList = []

const useTimeline = () => {
  const { data: timelineList = noEntries } = useTimelineQuery()
  return buildTimeline(timelineList)
}

export default useTimeline
