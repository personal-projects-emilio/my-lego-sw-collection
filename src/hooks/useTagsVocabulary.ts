import { useTagsQuery } from 'api/tags'
import type { TagsList } from 'types/tags'
import { buildTagsVocabulary } from 'utils/tags'

const noTags: TagsList = []

const useTagsVocabulary = () => {
  const { data: tagsList = noTags } = useTagsQuery()
  return buildTagsVocabulary(tagsList)
}

export default useTagsVocabulary
