import { useCallback, useMemo } from 'react'

import { queryKeys } from 'api/api.constants'
import { mutateTags, setTagsQueryData, useTagsQuery } from 'api/tags'
import useVocabularyMutations from 'hooks/useVocabularyMutations'
import type { TagsState } from 'utils/tags'

export { PartlySavedError } from 'hooks/useVocabularyMutations'

const useTagsMutations = () => {
  const { data: tagsList } = useTagsQuery()
  const { state, apply, isPending } = useVocabularyMutations({
    key: queryKeys.tags,
    list: tagsList,
    setQueryData: setTagsQueryData,
    save: mutateTags,
  })

  const tagsState = useMemo(
    (): TagsState | undefined =>
      state && {
        tagsList: state.list,
        setsList: state.setsList,
        minifigsList: state.minifigsList,
      },
    [state]
  )

  const applyTagsState = useCallback(
    ({ tagsList: list, setsList, minifigsList }: TagsState) =>
      apply({ list, setsList, minifigsList }),
    [apply]
  )

  return { state: tagsState, applyTagsState, isPending }
}

export default useTagsMutations
