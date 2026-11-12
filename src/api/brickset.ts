import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type { BricksetIgnoreList } from 'types/brickset'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

const fetchBricksetIgnoreList = (idToken: string) =>
  api
    .get<Partial<BricksetIgnoreList> | null>(endPoints.bricksetIgnoreList, {
      params: { auth: idToken },
    })
    // The Realtime DB drops empty arrays
    .then(({ data }): BricksetIgnoreList => ({
      ids: data?.ids ?? [],
      subthemes: data?.subthemes ?? [],
      themes: data?.themes ?? [],
    }))

export const useBricksetIgnoreListQuery = () => {
  const { idToken } = useAuth()
  return useQuery({
    queryKey: [queryKeys.bricksetIgnoreList],
    queryFn: () => fetchBricksetIgnoreList(idToken as string),
    enabled: Boolean(idToken),
  })
}

export const useBricksetIgnoreListMutation = () =>
  useMutation({
    mutationFn: (data: BricksetIgnoreList) =>
      api.put<BricksetIgnoreList>(endPoints.bricksetIgnoreList, data),
    onSuccess: (_response, data) =>
      queryClient.setQueryData([queryKeys.bricksetIgnoreList], data),
  })
