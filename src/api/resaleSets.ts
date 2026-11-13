import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from 'providers/AuthProvider'
import type { ResaleSet, ResaleSetsList } from 'types/resale'

import { endPoints, queryKeys } from './api.constants'
import { api, queryClient } from './index'

const withDroppedValues = (resaleSet: ResaleSet): ResaleSet => ({
  ...resaleSet,
  officialPrice: resaleSet.officialPrice ?? null,
  unitSellingPrice: resaleSet.unitSellingPrice ?? null,
  exitDate: resaleSet.exitDate ?? null,
})

const fetchResaleSets = (idToken: string) =>
  api
    .get<ResaleSetsList | null>(endPoints.resaleSets, {
      params: { auth: idToken },
    })
    .then(({ data }) => (data ?? []).map(withDroppedValues))

const setResaleSetsQueryData = (data: ResaleSetsList) =>
  queryClient.setQueryData([queryKeys.resaleSets], data)

export const useResaleSetsQuery = () => {
  const { idToken } = useAuth()
  return useQuery({
    queryKey: [queryKeys.resaleSets],
    queryFn: () => fetchResaleSets(idToken as string),
    enabled: Boolean(idToken),
  })
}

export const useResaleSetsMutation = () =>
  useMutation({
    mutationFn: (data: ResaleSetsList) =>
      api.put<ResaleSetsList | null>(endPoints.resaleSets, data),
    onSuccess: (_response, data) => setResaleSetsQueryData(data),
  })
