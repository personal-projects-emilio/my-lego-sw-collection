import { useMemo } from 'react'

import { useTagsQuery } from 'api/tags'
import type { TagsList } from 'types/tags'
import { buildVocabulary } from 'utils/tags'

const noTags: TagsList = []

const useVocabulary = () => {
  const { data: tagsList = noTags } = useTagsQuery()
  return useMemo(() => buildVocabulary(tagsList), [tagsList])
}

export default useVocabulary
