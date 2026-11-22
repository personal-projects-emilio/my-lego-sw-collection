import { useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type { ColumnLayout, ColumnLayoutId } from 'types/columnLayout'

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
    .get<ColumnLayout | null>(columnLayoutEndPoint(target), {
      params: { auth: idToken },
    })
    .then(({ data }) => data)

export const useColumnLayoutQuery = (columnLayoutId?: ColumnLayoutId) => {
  const { idToken, userId } = useAuth()
  return useQuery({
    queryKey: columnLayoutQueryKey({ userId, columnLayoutId }),
    queryFn: () =>
      fetchColumnLayout({
        idToken: idToken as string,
        userId: userId as string,
        columnLayoutId: columnLayoutId as ColumnLayoutId,
      }),
    enabled: Boolean(columnLayoutId && userId && idToken),
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
