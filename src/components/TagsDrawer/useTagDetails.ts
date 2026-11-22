import { useMemo } from 'react'

import { useCollection, useTagsVocabulary } from 'hooks'
import type { Tag, TaggedItem, TagId } from 'types/tags'

const useTagDetails = (descendants: Map<TagId, number>) => {
  const tagsVocabulary = useTagsVocabulary()
  const collection = useCollection()
  const usage = useMemo(() => {
    const count = (items: TaggedItem[] = []) => {
      const counts = new Map<TagId, number>()
      items.forEach(({ effectiveTags }) =>
        new Set(
          effectiveTags.flatMap((id) => [
            id,
            tagsVocabulary.getRoot(id)?.id ?? id,
          ])
        ).forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1))
      )
      return counts
    }
    return {
      sets: count(collection.setsList),
      minifigs: count(collection.minifigsList),
    }
  }, [collection.setsList, collection.minifigsList, tagsVocabulary])

  return (tag: Tag) => {
    const sets = usage.sets.get(tag.id) ?? 0
    const minifigs = usage.minifigs.get(tag.id) ?? 0
    return [
      ...(tag.parent
        ? []
        : [
            tag.appliesTo === 'both' ? 'sets & minifigs' : tag.appliesTo,
            tag.inherited && 'inherited',
          ]),
      descendants.has(tag.id) && `${descendants.get(tag.id)} tags`,
      sets && `${sets} sets`,
      minifigs && `${minifigs} minifigs`,
    ]
      .filter(Boolean)
      .join(' · ')
  }
}

export default useTagDetails
