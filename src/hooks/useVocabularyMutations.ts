import { useCallback, useMemo, useRef, useState } from 'react'

import { queryClient } from 'api'
import { queryKeys } from 'api/api.constants'
import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { useMinifigsMutations } from 'pages/Minifigs/hooks'
import { useSetsMutations } from 'pages/Sets/hooks'
import { useAuth } from 'providers/AuthProvider'
import type { MinifigsList } from 'types/minifigs'
import type { SetsList } from 'types/sets'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

export class PartlySavedError extends Error {}

export type VocabularyState<T> = {
  list: T[]
  setsList: SetsList
  minifigsList: MinifigsList
}

type Vocabulary<T> = {
  key: string
  list: T[] | undefined
  setQueryData: (list: T[]) => unknown
  save: (list: T[]) => Promise<unknown>
}

const useVocabularyMutations = <T>({
  key,
  list,
  setQueryData,
  save,
}: Vocabulary<T>) => {
  const { data: setsList } = useSetsQuery()
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()
  const { editSetsList } = useSetsMutations()
  const { editMinifigsList } = useMinifigsMutations()
  const [isPending, setIsPending] = useState(false)
  const pending = useRef(false)

  const state = useMemo(
    (): VocabularyState<T> | undefined =>
      list && setsList && minifigsList
        ? { list, setsList, minifigsList }
        : undefined,
    [list, setsList, minifigsList]
  )

  const apply = useCallback(
    async (next: VocabularyState<T>) => {
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
        setQueryData(next.list)
        if (idToken) await save(next.list)
      } catch (err) {
        console.error(`Unable to edit ${key}`, err)
        setQueryData(state.list)
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
    [state, idToken, key, save, setQueryData, editSetsList, editMinifigsList]
  )

  return { state, apply, isPending }
}

export default useVocabularyMutations
