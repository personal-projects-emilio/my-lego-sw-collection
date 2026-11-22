import { skipToken, useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type {
  ColumnLayout,
  ColumnLayoutId,
  ColumnLayoutTarget,
} from 'types/columnLayout'

import { getColumnLayoutEndPoint, queryKeys } from './api.constants'
import { api, queryClient } from './index'

type AuthenticatedTarget = ColumnLayoutTarget & { idToken: string }

const getColumnLayoutQueryKey = ({
  userId,
  columnLayoutId,
}: Partial<ColumnLayoutTarget>) => [
  queryKeys.columnLayout,
  userId,
  columnLayoutId,
]

const fetchColumnLayout = ({ idToken, ...target }: AuthenticatedTarget) =>
  api
    .get<Partial<ColumnLayout> | null>(getColumnLayoutEndPoint(target), {
      params: { auth: idToken },
    })
    .then(({ data }) =>
      data?.columnState
        ? {
            columnState: data.columnState,
            showTotalRow: data.showTotalRow ?? true,
          }
        : null
    )

export const useColumnLayoutQuery = (columnLayoutId?: ColumnLayoutId) => {
  const { idToken, userId } = useAuth()
  return useQuery({
    queryKey: getColumnLayoutQueryKey({ userId, columnLayoutId }),
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
  await api.put(getColumnLayoutEndPoint(target), layout, {
    params: { auth: idToken },
  })
  queryClient.setQueryData(getColumnLayoutQueryKey(target), layout)
}

export const deleteColumnLayout = async ({
  idToken,
  ...target
}: AuthenticatedTarget) => {
  queryClient.setQueryData(getColumnLayoutQueryKey(target), null)
  await api.delete(getColumnLayoutEndPoint(target), {
    params: { auth: idToken },
  })
}
