import { skipToken, useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type { ColumnLayoutId, ColumnLayoutTarget } from 'types/columnLayout'
import type { FilterSearch } from 'types/itemsFilter'
import { hasFilterSearch, pickFilterSearch } from 'utils/itemsFilter'

import { getSavedFilterEndPoint, queryKeys } from './api.constants'
import { api, queryClient } from './index'

type AuthenticatedTarget = ColumnLayoutTarget & { idToken: string }

export const getSavedFilterQueryKey = ({
  userId,
  columnLayoutId,
}: Partial<ColumnLayoutTarget>) => [
  queryKeys.savedFilter,
  userId,
  columnLayoutId,
]

const fetchSavedFilter = ({ idToken, ...target }: AuthenticatedTarget) =>
  api
    .get<FilterSearch | null>(getSavedFilterEndPoint(target), {
      params: { auth: idToken },
    })
    .then(({ data }) => (data ? pickFilterSearch(data) : null))

export const useSavedFilterQuery = (columnLayoutId: ColumnLayoutId) => {
  const { idToken, userId } = useAuth()
  return useQuery({
    queryKey: getSavedFilterQueryKey({ userId, columnLayoutId }),
    queryFn:
      userId && idToken
        ? () => fetchSavedFilter({ idToken, userId, columnLayoutId })
        : skipToken,
  })
}

export const saveFilter = async ({
  idToken,
  filter,
  ...target
}: AuthenticatedTarget & { filter: FilterSearch }) => {
  const config = { params: { auth: idToken } }
  if (hasFilterSearch(filter))
    await api.put(getSavedFilterEndPoint(target), filter, config)
  else await api.delete(getSavedFilterEndPoint(target), config)
  queryClient.setQueryData(
    getSavedFilterQueryKey(target),
    hasFilterSearch(filter) ? filter : null
  )
}
