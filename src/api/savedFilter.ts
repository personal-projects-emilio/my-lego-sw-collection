import { skipToken, useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type { FilterSearch } from 'types/itemsFilter'
import { hasFilterSearch, pickFilterSearch } from 'utils/itemsFilter'

import { getSavedFilterEndPoint, queryKeys } from './api.constants'
import { api, queryClient } from './index'

type SavedFilterTarget = { idToken: string; userId: string }

export const getSavedFilterQueryKey = (userId?: string) => [
  queryKeys.savedFilter,
  userId,
]

const fetchSavedFilter = ({ idToken, userId }: SavedFilterTarget) =>
  api
    .get<FilterSearch | null>(getSavedFilterEndPoint(userId), {
      params: { auth: idToken },
    })
    .then(({ data }) => (data ? pickFilterSearch(data) : null))

export const useSavedFilterQuery = () => {
  const { idToken, userId } = useAuth()
  return useQuery({
    queryKey: getSavedFilterQueryKey(userId),
    queryFn:
      userId && idToken
        ? () => fetchSavedFilter({ idToken, userId })
        : skipToken,
  })
}

export const saveFilter = async ({
  filter,
  idToken,
  userId,
}: SavedFilterTarget & { filter: FilterSearch }) => {
  const config = { params: { auth: idToken } }
  if (hasFilterSearch(filter))
    await api.put(getSavedFilterEndPoint(userId), filter, config)
  else await api.delete(getSavedFilterEndPoint(userId), config)
  queryClient.setQueryData(
    getSavedFilterQueryKey(userId),
    hasFilterSearch(filter) ? filter : null
  )
}
