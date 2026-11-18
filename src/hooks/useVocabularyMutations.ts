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
import type { Tag } from 'types/tags'
import type { TimelineEntry } from 'types/timeline'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

export class PartlySavedError extends Error {}

type VocabularyConfig<ListKey extends string, Entry> = {
  queryKey: string
  listKey: ListKey
  useList: () => Entry[] | undefined
  setQueryData: (list: Entry[]) => unknown
  save: (list: Entry[]) => Promise<unknown>
}

type MapVocabulariesToConfig = {
  tags: VocabularyConfig<'tagsList', Tag>
  timeline: VocabularyConfig<'timelineList', TimelineEntry>
}

const mapVocabulariesToConfig: MapVocabulariesToConfig = {
  tags: {
    queryKey: queryKeys.tags,
    listKey: 'tagsList',
    useList: () => useTagsQuery().data,
    setQueryData: setTagsQueryData,
    save: mutateTags,
  },
  timeline: {
    queryKey: queryKeys.timeline,
    listKey: 'timelineList',
    useList: () => useTimelineQuery().data,
    setQueryData: setTimelineQueryData,
    save: mutateTimeline,
  },
}

type Vocabulary = keyof MapVocabulariesToConfig

type StateOf<Name extends Vocabulary> =
  MapVocabulariesToConfig[Name] extends VocabularyConfig<
    infer ListKey,
    infer Entry
  >
    ? VocabularyState<ListKey, Entry>
    : never

type AnyState = VocabularyState<string, unknown>

const useVocabularyMutations = <Name extends Vocabulary>(vocabulary: Name) => {
  const { queryKey, listKey, useList, setQueryData, save } =
    mapVocabulariesToConfig[vocabulary] as VocabularyConfig<string, unknown>
  const list = useList()
  const { data: setsList } = useSetsQuery()
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()
  const { editSetsList } = useSetsMutations()
  const { editMinifigsList } = useMinifigsMutations()
  const [isPending, setIsPending] = useState(false)
  const pending = useRef(false)

  const state = useMemo(
    (): AnyState | undefined =>
      list && setsList && minifigsList
        ? ({ [listKey]: list, setsList, minifigsList } as AnyState)
        : undefined,
    [listKey, list, setsList, minifigsList]
  )

  const apply = useCallback(
    async (next: AnyState) => {
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
        setQueryData(next[listKey])
        if (idToken) await save(next[listKey])
      } catch (error) {
        console.error(`Unable to edit ${queryKey}`, error)
        setQueryData(state[listKey])
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
      listKey,
      save,
      setQueryData,
      editSetsList,
      editMinifigsList,
    ]
  )

  return {
    state: state as StateOf<Name> | undefined,
    apply: apply as (next: StateOf<Name>) => Promise<void>,
    isPending,
  }
}

export default useVocabularyMutations
