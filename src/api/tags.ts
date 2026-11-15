import { useQuery } from '@tanstack/react-query'
import type { TagsList } from 'types/tags'

import { endPoints, queryKeys } from './api.constants'
import { api } from './index'

const fetchTags = () =>
  api.get<TagsList | null>(endPoints.tags).then(({ data }) => data ?? [])

export const useTagsQuery = () =>
  useQuery({
    queryKey: [queryKeys.tags],
    queryFn: fetchTags,
  })
