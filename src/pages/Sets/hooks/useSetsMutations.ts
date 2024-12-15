import { useCallback } from 'react'

import { useMutation } from '@tanstack/react-query'
import { mutateSets, setSetsQueryData, useSetsQuery } from 'api/sets'
import { useAuth } from 'providers'
import type { Set, SetsList } from 'types/sets'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

const useSetsMutations = () => {
  const { data: setsList } = useSetsQuery()
  const { idToken } = useAuth()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: SetsList) => mutateSets(data),
    onSuccess: ({ data }) => setSetsQueryData(data),
  })

  const addSet = useCallback(
    async (set: Set) => {
      assert(isNotNullOrUndefined(setsList))

      const updatedSetsList = [...setsList, set].sort((a, b) =>
        String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
      )

      if (!idToken) {
        setSetsQueryData(updatedSetsList)
        return
      }

      await mutateAsync(updatedSetsList, {
        onError: (err) => console.error('Unable to add the set', err),
      })
    },
    [idToken, setsList, mutateAsync]
  )

  const deleteSet = useCallback(
    async (setId: Set['id']) => {
      assert(isNotNullOrUndefined(setsList))

      const updatedSetsList = setsList.filter(({ id }) => id !== setId)

      if (!idToken) {
        setSetsQueryData(updatedSetsList)
        return
      }

      await mutateAsync(updatedSetsList, {
        onError: (err) => console.error('Unable to delete the set', err),
      })
    },
    [idToken, setsList, mutateAsync]
  )

  const editSet = useCallback(
    async (set: Set) => {
      assert(isNotNullOrUndefined(setsList))

      const updatedSetsList = setsList
        .map((existingSet) => (existingSet.id === set.id ? set : existingSet))
        .sort((a, b) =>
          String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
        )

      if (!idToken) {
        setSetsQueryData(updatedSetsList)
        return
      }

      await mutateAsync(updatedSetsList, {
        onError: (err) => console.error('Unable to edit the set', err),
      })
    },
    [idToken, setsList, mutateAsync]
  )

  const editSetsList = useCallback(
    async (newSetsList: SetsList) => {
      assert(isNotNullOrUndefined(setsList))

      if (!idToken) {
        setSetsQueryData(newSetsList)
        return
      }

      await mutateAsync(newSetsList, {
        onError: (err) => console.error('Unable to edit sets list', err),
      })
    },
    [idToken, setsList, mutateAsync]
  )

  const toggleSetPossession = useCallback(
    async (setId: Set['id']) => {
      assert(isNotNullOrUndefined(setsList))

      const updatedSetsList = setsList.map((set) =>
        set.id === setId ? { ...set, possessed: !set.possessed } : set
      )

      if (!idToken) {
        setSetsQueryData(updatedSetsList)
        return
      }

      await mutateAsync(updatedSetsList, {
        onError: (err) => console.error('Unable to toggle set owned', err),
      })
    },
    [idToken, setsList, mutateAsync]
  )

  return {
    addSet,
    deleteSet,
    editSet,
    editSetsList,
    isPending,
    toggleSetPossession,
  }
}

export default useSetsMutations
