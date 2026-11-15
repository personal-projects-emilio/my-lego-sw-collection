import { useQuery } from '@tanstack/react-query'
import type { TagsList } from 'types/tags'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

const fetchTags = () =>
  api.get<TagsList | null>(endPoints.tags).then(({ data }) => data ?? [])

export const mutateTags = async (data: TagsList) =>
  await api.put<TagsList>(endPoints.tags, data)

export const setTagsQueryData = (data: TagsList) =>
  queryClient.setQueryData([queryKeys.tags], data)

export const useTagsQuery = () =>
  useQuery({
    queryKey: [queryKeys.tags],
    queryFn: fetchTags,
  })
