import { useCallback } from 'react'

import { useMutation } from '@tanstack/react-query'
import {
  mutateMinifigs,
  setMinifigsQueryData,
  useMinifigsQuery,
} from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { useSetsMutations } from 'pages/Sets/hooks'
import { useAuth } from 'providers/AuthProvider'
import type { Minifig, MinifigsList } from 'types/minifigs'
import { renameMinifigInSets } from 'utils/lego'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

const useMinifigsMutations = () => {
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()
  const { data: setsList } = useSetsQuery()
  const { editSetsList } = useSetsMutations()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: MinifigsList) => mutateMinifigs(data),
    onSuccess: ({ data }) => setMinifigsQueryData(data),
  })

  const addMinifig = useCallback(
    async (minifig: Minifig) => {
      assert(isNotNullOrUndefined(minifigsList))

      const updatedMinifigsList = [...minifigsList, minifig].sort((a, b) =>
        a.id.localeCompare(b.id)
      )

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
    async ({
      newMinifig,
      previousMinifig,
    }: {
      newMinifig: Minifig
      previousMinifig: Minifig
    }) => {
      assert(isNotNullOrUndefined(minifigsList))

      const updatedMinifigsList = minifigsList
        .filter(({ id }) => id !== previousMinifig.id)
        .concat(newMinifig)
        .sort((a, b) => a.id.localeCompare(b.id))
      const renamedSetsList =
        setsList && previousMinifig.id !== newMinifig.id
          ? renameMinifigInSets(setsList, previousMinifig.id, newMinifig.id)
          : setsList

      if (!idToken) {
        setMinifigsQueryData(updatedMinifigsList)
      } else {
        await mutateAsync(updatedMinifigsList, {
          onError: (err) => console.error('Unable to edit the minifig', err),
        })
      }
      if (renamedSetsList && renamedSetsList !== setsList) {
        await editSetsList(renamedSetsList)
      }
    },
    [idToken, minifigsList, mutateAsync, setsList, editSetsList]
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
