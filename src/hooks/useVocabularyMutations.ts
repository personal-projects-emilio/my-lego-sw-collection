import { useCallback, useMemo, useRef, useState } from 'react'

import { queryClient } from 'api'
import { queryKeys } from 'api/api.constants'
import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { useMinifigsMutations } from 'pages/Minifigs/hooks'
import { useSetsMutations } from 'pages/Sets/hooks'
import { useAuth } from 'providers/AuthProvider'
import type { VocabularyState } from 'types/common'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

export class PartlySavedError extends Error {}

type Vocabulary<K extends string, T> = {
  key: string
  listKey: K
  list: T[] | undefined
  setQueryData: (list: T[]) => unknown
  save: (list: T[]) => Promise<unknown>
}

const useVocabularyMutations = <K extends string, T>({
  key,
  listKey,
  list,
  setQueryData,
  save,
}: Vocabulary<K, T>) => {
  const { data: setsList } = useSetsQuery()
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()
  const { editSetsList } = useSetsMutations()
  const { editMinifigsList } = useMinifigsMutations()
  const [isPending, setIsPending] = useState(false)
  const pending = useRef(false)

  const state = useMemo(
    (): VocabularyState<K, T> | undefined =>
      list && setsList && minifigsList
        ? ({ [listKey]: list, setsList, minifigsList } as VocabularyState<K, T>)
        : undefined,
    [listKey, list, setsList, minifigsList]
  )

  const apply = useCallback(
    async (next: VocabularyState<K, T>) => {
      assert(isNotNullOrUndefined(state))
      if (pending.current) throw new Error('A change is already being saved')
      pending.current = true
      setIsPending(true)
      const savedKeys = [key, queryKeys.sets, queryKeys.minifigs]
      const restores: Array<() => Promise<void>> = []
      try {
        await Promise.all(
          savedKeys.map((k) => queryClient.cancelQueries({ queryKey: [k] }))
        )
        if (next.setsList !== state.setsList) {
          await editSetsList(next.setsList)
          restores.push(() => editSetsList(state.setsList))
        }
        if (next.minifigsList !== state.minifigsList) {
          await editMinifigsList(next.minifigsList)
          restores.push(() => editMinifigsList(state.minifigsList))
        }
        setQueryData(next[listKey])
        if (idToken) await save(next[listKey])
      } catch (err) {
        console.error(`Unable to edit ${key}`, err)
        setQueryData(state[listKey])
        const restored = await Promise.allSettled(
          restores.map((restore) => restore())
        )
        if (idToken)
          await Promise.allSettled(
            savedKeys.map((k) =>
              queryClient.invalidateQueries({ queryKey: [k] })
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
    [
      state,
      idToken,
      key,
      listKey,
      save,
      setQueryData,
      editSetsList,
      editMinifigsList,
    ]
  )

  return { state, apply, isPending }
}

export default useVocabularyMutations
