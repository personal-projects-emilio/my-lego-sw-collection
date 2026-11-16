import { useCallback, useMemo, useRef, useState } from 'react'

import { queryClient } from 'api'
import { queryKeys } from 'api/api.constants'
import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { mutateTags, setTagsQueryData, useTagsQuery } from 'api/tags'
import { useMinifigsMutations } from 'pages/Minifigs/hooks'
import { useSetsMutations } from 'pages/Sets/hooks'
import { useAuth } from 'providers/AuthProvider'
import type { TagsState } from 'utils/tags'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

export class PartlySavedError extends Error {}

const savedKeys = [queryKeys.tags, queryKeys.sets, queryKeys.minifigs]

const useTagsMutations = () => {
  const { data: tagsList } = useTagsQuery()
  const { data: setsList } = useSetsQuery()
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()
  const { editSetsList } = useSetsMutations()
  const { editMinifigsList } = useMinifigsMutations()
  const [isPending, setIsPending] = useState(false)
  const pending = useRef(false)

  const state = useMemo(
    () =>
      tagsList && setsList && minifigsList
        ? { tagsList, setsList, minifigsList }
        : undefined,
    [tagsList, setsList, minifigsList]
  )

  const applyTagsState = useCallback(
    async (next: TagsState) => {
      assert(isNotNullOrUndefined(state))
      if (pending.current) throw new Error('A change is already being saved')
      pending.current = true
      setIsPending(true)
      const restores: Array<() => Promise<void>> = []
      try {
        await Promise.all(
          savedKeys.map((key) => queryClient.cancelQueries({ queryKey: [key] }))
        )
        if (next.setsList !== state.setsList) {
          await editSetsList(next.setsList)
          restores.push(() => editSetsList(state.setsList))
        }
        if (next.minifigsList !== state.minifigsList) {
          await editMinifigsList(next.minifigsList)
          restores.push(() => editMinifigsList(state.minifigsList))
        }
        setTagsQueryData(next.tagsList)
        if (idToken) await mutateTags(next.tagsList)
      } catch (err) {
        console.error('Unable to edit tags', err)
        setTagsQueryData(state.tagsList)
        const restored = await Promise.allSettled(
          restores.map((restore) => restore())
        )
        if (idToken)
          await Promise.allSettled(
            savedKeys.map((key) =>
              queryClient.invalidateQueries({ queryKey: [key] })
            )
          )
        if (restored.some(({ status }) => status === 'rejected'))
          throw new PartlySavedError(
            'The change was only partly saved, so the saved data was reloaded'
          )
        throw err
      } finally {
        pending.current = false
        setIsPending(false)
      }
    },
    [state, idToken, editSetsList, editMinifigsList]
  )

  return { state, applyTagsState, isPending }
}

export default useTagsMutations
