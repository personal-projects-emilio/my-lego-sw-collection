import { skipToken, useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type {
  ColumnLayout,
  ColumnLayoutId,
  ColumnLayoutTarget,
  SavedColumnLayout,
} from 'types/columnLayout'
import { toColumnLayout } from 'utils/columnLayout'

import { columnLayoutEndPoint, queryKeys } from './api.constants'
import { api, queryClient } from './index'

type AuthenticatedTarget = ColumnLayoutTarget & { idToken: string }

const columnLayoutQueryKey = ({
  userId,
  columnLayoutId,
}: Partial<ColumnLayoutTarget>) => [
  queryKeys.columnLayout,
  userId,
  columnLayoutId,
]

const fetchColumnLayout = ({ idToken, ...target }: AuthenticatedTarget) =>
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
  idToken,
  layout,
  ...target
}: AuthenticatedTarget & { layout: ColumnLayout }) => {
  await api.put(columnLayoutEndPoint(target), layout, {
    params: { auth: idToken },
  })
  queryClient.setQueryData(columnLayoutQueryKey(target), layout)
}

export const deleteColumnLayout = async ({
  idToken,
  ...target
}: AuthenticatedTarget) => {
  queryClient.setQueryData(columnLayoutQueryKey(target), null)
  await api.delete(columnLayoutEndPoint(target), { params: { auth: idToken } })
}
