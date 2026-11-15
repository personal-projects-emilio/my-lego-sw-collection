import { useCallback, useMemo, useState } from 'react'

import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { mutateTags, setTagsQueryData, useTagsQuery } from 'api/tags'
import { useMinifigsMutations } from 'pages/Minifigs/hooks'
import { useSetsMutations } from 'pages/Sets/hooks'
import { useAuth } from 'providers/AuthProvider'
import type { TagsState } from 'utils/tags'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

const useTagsMutations = () => {
  const { data: tagsList } = useTagsQuery()
  const { data: setsList } = useSetsQuery()
  const { data: minifigsList } = useMinifigsQuery()
  const { idToken } = useAuth()
  const { editSetsList } = useSetsMutations()
  const { editMinifigsList } = useMinifigsMutations()
  const [isPending, setIsPending] = useState(false)

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
      setIsPending(true)
      try {
        if (next.setsList !== state.setsList) await editSetsList(next.setsList)
        if (next.minifigsList !== state.minifigsList)
          await editMinifigsList(next.minifigsList)
        setTagsQueryData(next.tagsList)
        if (idToken)
          await mutateTags(next.tagsList).catch((err) => {
            setTagsQueryData(state.tagsList)
            throw err
          })
      } finally {
        setIsPending(false)
      }
    },
    [state, idToken, editSetsList, editMinifigsList]
  )

  return { state, applyTagsState, isPending }
}

export default useTagsMutations
