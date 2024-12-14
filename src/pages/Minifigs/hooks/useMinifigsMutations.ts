import { useCallback } from 'react'

import { useMutation } from '@tanstack/react-query'
import {
  mutateMinifigs,
  setMinifigsQueryData,
  useMinifigsQuery,
} from 'api/minifigs'
import { useAuth } from 'providers'
import type { Minifig, MinifigsList } from 'types/minifigs'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

const useMinifigsMutations = () => {
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: MinifigsList) => mutateMinifigs(data),
    onSuccess: ({ data }) => setMinifigsQueryData(data),
  })

  const addMinifig = useCallback(
    async (minifig: Minifig) => {
      assert(isNotNullOrUndefined(minifigsList))

      const updatedMinifigsList = minifigsList
        .concat(minifig)
        .sort((a, b) => a.id.localeCompare(b.id))

      if (!idToken) {
        setMinifigsQueryData(updatedMinifigsList)
        return
      }

      await mutateAsync(updatedMinifigsList, {
        onError: (err) => console.error('Unable to add the minifig', err),
      })
    },
    [idToken, minifigsList, mutateAsync]
  )

  const deleteMinifig = useCallback(
    async (minifigId: Minifig['id']) => {
      assert(isNotNullOrUndefined(minifigsList))

      const updatedMinifigsList = minifigsList.filter(
        ({ id }) => id !== minifigId
      )

      if (!idToken) {
        setMinifigsQueryData(updatedMinifigsList)
        return
      }

      await mutateAsync(updatedMinifigsList, {
        onError: (err) => console.error('Unable to delete the minifig', err),
      })
    },
    [idToken, minifigsList, mutateAsync]
  )

  const editMinifig = useCallback(
    async (minifig: Minifig) => {
      assert(isNotNullOrUndefined(minifigsList))

      const updatedMinifigsList = minifigsList
        .map((existingMinifig) =>
          existingMinifig.id === minifig.id ? minifig : existingMinifig
        )
        .sort((a, b) => a.id.localeCompare(b.id))

      if (!idToken) {
        setMinifigsQueryData(updatedMinifigsList)
        return
      }

      await mutateAsync(updatedMinifigsList, {
        onError: (err) => console.error('Unable to edit the minifig', err),
      })
    },
    [idToken, minifigsList, mutateAsync]
  )

  const editMinifigsList = useCallback(
    async (newMinifigsList: MinifigsList) => {
      assert(isNotNullOrUndefined(minifigsList))

      if (!idToken) {
        setMinifigsQueryData(newMinifigsList)
        return
      }

      await mutateAsync(newMinifigsList, {
        onError: (err) => console.error('Unable to edit minifigs list', err),
      })
    },
    [idToken, minifigsList, mutateAsync]
  )

  const toggleMinifigPossession = useCallback(
    async (minifigId: Minifig['id']) => {
      assert(isNotNullOrUndefined(minifigsList))

      const updatedMinifigsList = minifigsList.map((minifig) =>
        minifig.id === minifigId
          ? { ...minifig, possessed: !minifig.possessed }
          : minifig
      )

      if (!idToken) {
        setMinifigsQueryData(updatedMinifigsList)
        return
      }

      await mutateAsync(updatedMinifigsList, {
        onError: (err) => console.error('Unable to toggle minifig owned', err),
      })
    },
    [idToken, minifigsList, mutateAsync]
  )

  return {
    addMinifig,
    deleteMinifig,
    editMinifig,
    editMinifigsList,
    isPending,
    toggleMinifigPossession,
  }
}

export default useMinifigsMutations
