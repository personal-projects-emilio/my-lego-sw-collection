import { useCallback, useMemo, useRef, useState } from 'react'

import { queryClient } from 'api'
import { queryKeys } from 'api/api.constants'
import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { mutateTags, setTagsQueryData, useTagsQuery } from 'api/tags'
import {
  mutateTimeline,
  setTimelineQueryData,
  useTimelineQuery,
} from 'api/timeline'
import { useMinifigsMutations } from 'pages/Minifigs/hooks'
import { useSetsMutations } from 'pages/Sets/hooks'
import { useAuth } from 'providers/AuthProvider'
import type { VocabularyState } from 'types/common'
import type { MinifigsList } from 'types/minifigs'
import type { SetsList } from 'types/sets'
import type { Tag } from 'types/tags'
import type { TimelineEntry } from 'types/timeline'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

export class PartlySavedError extends Error {}

type ItemsState = { setsList: SetsList; minifigsList: MinifigsList }

type VocabularyConfig<Entry, State extends ItemsState> = {
  queryKey: string
  useList: () => Entry[] | undefined
  setQueryData: (list: Entry[]) => unknown
  save: (list: Entry[]) => Promise<unknown>
  toState: (parts: ItemsState & { list: Entry[] }) => State
  listOf: (state: State) => Entry[]
}

export const tagsVocabularyConfig: VocabularyConfig<
  Tag,
  VocabularyState<'tagsList', Tag>
> = {
  queryKey: queryKeys.tags,
  useList: () => useTagsQuery().data,
  setQueryData: setTagsQueryData,
  save: mutateTags,
  toState: ({ list, ...items }) => ({ tagsList: list, ...items }),
  listOf: ({ tagsList }) => tagsList,
}

export const timelineVocabularyConfig: VocabularyConfig<
  TimelineEntry,
  VocabularyState<'timelineList', TimelineEntry>
> = {
  queryKey: queryKeys.timeline,
  useList: () => useTimelineQuery().data,
  setQueryData: setTimelineQueryData,
  save: mutateTimeline,
  toState: ({ list, ...items }) => ({ timelineList: list, ...items }),
  listOf: ({ timelineList }) => timelineList,
}

const useVocabularyMutations = <Entry, State extends ItemsState>(
  config: VocabularyConfig<Entry, State>
) => {
  const { queryKey, useList, setQueryData, save, toState, listOf } = config
  const list = useList()
  const { data: setsList } = useSetsQuery()
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()
  const { editSetsList } = useSetsMutations()
  const { editMinifigsList } = useMinifigsMutations()
  const [isPending, setIsPending] = useState(false)
  const pending = useRef(false)

  const state = useMemo(
    () =>
      list && setsList && minifigsList
        ? toState({ list, setsList, minifigsList })
        : undefined,
    [toState, list, setsList, minifigsList]
  )

  const apply = useCallback(
    async (next: State) => {
      assert(isNotNullOrUndefined(state))
      if (pending.current) throw new Error('A change is already being saved')
      pending.current = true
      setIsPending(true)
      const savedKeys = [queryKey, queryKeys.sets, queryKeys.minifigs]
      const restores: Array<() => Promise<void>> = []
      try {
        await Promise.all(
          savedKeys.map((savedKey) =>
            queryClient.cancelQueries({ queryKey: [savedKey] })
          )
        )
        if (next.setsList !== state.setsList) {
          await editSetsList(next.setsList)
          restores.push(() => editSetsList(state.setsList))
        }
        if (next.minifigsList !== state.minifigsList) {
          await editMinifigsList(next.minifigsList)
          restores.push(() => editMinifigsList(state.minifigsList))
        }
        setQueryData(listOf(next))
        if (idToken) await save(listOf(next))
      } catch (error) {
        console.error(`Unable to edit ${queryKey}`, error)
        setQueryData(listOf(state))
        const restored = await Promise.allSettled(
          restores.map((restore) => restore())
        )
        if (idToken)
          await Promise.allSettled(
            savedKeys.map((savedKey) =>
              queryClient.invalidateQueries({ queryKey: [savedKey] })
            )
          )
        if (restored.some(({ status }) => status === 'rejected'))
          throw new PartlySavedError(
            'The change was only partly saved, so the saved data was reloaded'
          )
        throw error
      } finally {
        pending.current = false
        setIsPending(false)
      }
    },
    [
      state,
      idToken,
      queryKey,
      listOf,
      save,
      setQueryData,
      editSetsList,
      editMinifigsList,
    ]
  )

  return { state, apply, isPending }
}

export default useVocabularyMutations
