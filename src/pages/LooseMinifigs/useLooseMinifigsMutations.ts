import { useCallback } from 'react'

import { useMutation } from '@tanstack/react-query'
import {
  mutateLooseMinifigs,
  setLooseMinifigsQueryData,
  useLooseMinifigsQuery,
} from 'api/looseMinifigs'
import { useAuth } from 'providers/AuthProvider'
import type { LooseMinifig, LooseMinifigsList, Minifig } from 'types/minifigs'
import { updateLooseMinifig } from 'utils/lego'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

const useLooseMinifigsMutations = () => {
  const { data: looseMinifigsList } = useLooseMinifigsQuery()
  const { idToken } = useAuth()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: LooseMinifigsList) => mutateLooseMinifigs(data),
    onSuccess: (_response, data) => setLooseMinifigsQueryData(data),
  })

  const editLooseMinifigsList = useCallback(
    async (newLooseMinifigsList: LooseMinifigsList) => {
      assert(isNotNullOrUndefined(looseMinifigsList))

      setLooseMinifigsQueryData(newLooseMinifigsList)
      if (!idToken) return

      await mutateAsync(newLooseMinifigsList, {
        onError: (err) => {
          setLooseMinifigsQueryData(looseMinifigsList)
          console.error('Unable to edit the loose minifigs list', err)
        },
      })
    },
    [idToken, looseMinifigsList, mutateAsync]
  )

  const editLooseMinifig = useCallback(
    async (minifigId: Minifig['id'], changes: Partial<LooseMinifig>) => {
      assert(isNotNullOrUndefined(looseMinifigsList))
      await editLooseMinifigsList(
        updateLooseMinifig(looseMinifigsList, minifigId, changes)
      )
    },
    [editLooseMinifigsList, looseMinifigsList]
  )

  return {
    editLooseMinifig,
    editLooseMinifigsList,
    isPending,
    looseMinifigsList,
  }
}

export default useLooseMinifigsMutations
