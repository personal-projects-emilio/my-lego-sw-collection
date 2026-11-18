import { useQuery } from '@tanstack/react-query'
import type { TimelineList } from 'types/timeline'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

const fetchTimeline = () =>
  api
    .get<TimelineList | null>(endPoints.timeline)
    .then(({ data }) => data ?? [])

export const mutateTimeline = async (data: TimelineList) =>
  await api.put<TimelineList>(endPoints.timeline, data)

export const setTimelineQueryData = (data: TimelineList) =>
  queryClient.setQueryData([queryKeys.timeline], data)

export const useTimelineQuery = () =>
  useQuery({
    queryKey: [queryKeys.timeline],
    queryFn: fetchTimeline,
  })
