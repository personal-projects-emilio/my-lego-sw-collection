import { skipToken, useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type {
  ColumnLayout,
  ColumnLayoutId,
  SavedColumnLayout,
} from 'types/columnLayout'
import { toColumnLayout } from 'utils/columnLayout'

import { columnLayoutEndPoint, queryKeys } from './api.constants'
import { api, queryClient } from './index'

type ColumnLayoutTarget = { userId: string; columnLayoutId: ColumnLayoutId }

const columnLayoutQueryKey = ({
  userId,
  columnLayoutId,
}: Partial<ColumnLayoutTarget>) => [
  queryKeys.columnLayout,
  userId,
  columnLayoutId,
]

const fetchColumnLayout = ({
  idToken,
  ...target
}: ColumnLayoutTarget & { idToken: string }) =>
  api
    .get<SavedColumnLayout | null>(columnLayoutEndPoint(target), {
      params: { auth: idToken },
    })
    .then(({ data }) => (data ? toColumnLayout({ state: data }) : null))

export const useColumnLayoutQuery = (columnLayoutId?: ColumnLayoutId) => {
  const { idToken, userId } = useAuth()
  return useQuery({
    queryKey: columnLayoutQueryKey({ userId, columnLayoutId }),
    queryFn:
      columnLayoutId && userId && idToken
        ? () => fetchColumnLayout({ idToken, userId, columnLayoutId })
        : skipToken,
  })
}

export const saveColumnLayout = async ({
  layout,
  ...target
}: ColumnLayoutTarget & { layout: ColumnLayout }) => {
  await api.put(columnLayoutEndPoint(target), layout)
  queryClient.setQueryData(columnLayoutQueryKey(target), layout)
}

export const deleteColumnLayout = async (target: ColumnLayoutTarget) => {
  await api.delete(columnLayoutEndPoint(target))
  queryClient.setQueryData(columnLayoutQueryKey(target), null)
}
