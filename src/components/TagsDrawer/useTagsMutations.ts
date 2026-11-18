import { queryKeys } from 'api/api.constants'
import { mutateTags, setTagsQueryData, useTagsQuery } from 'api/tags'
import useVocabularyMutations from 'hooks/useVocabularyMutations'

export { PartlySavedError } from 'hooks/useVocabularyMutations'

const useTagsMutations = () =>
  useVocabularyMutations({
    key: queryKeys.tags,
    listKey: 'tagsList',
    list: useTagsQuery().data,
    setQueryData: setTagsQueryData,
    save: mutateTags,
  })

export default useTagsMutations
