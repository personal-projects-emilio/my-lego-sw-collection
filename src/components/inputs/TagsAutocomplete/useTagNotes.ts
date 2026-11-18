import type { InheritedTags, TagId } from 'types/tags'
import { inheritedFrom, type TagsVocabulary } from 'utils/tags'

const useTagNotes = ({
  tagsVocabulary,
  options,
  chips,
  isFilter,
  inheritedTags,
}: {
  tagsVocabulary: TagsVocabulary
  options: TagId[]
  chips: TagId[]
  isFilter: boolean
  inheritedTags: InheritedTags
}) => {
  const coveringChips = new Map<TagId, TagId[]>()
  const chipSet = new Set(chips)
  if (isFilter) {
    options.forEach((id) => {
      const covering = tagsVocabulary
        .ancestors(id)
        .map((tag) => tag.id)
        .filter((ancestor) => chipSet.has(ancestor))
      if (covering.length) coveringChips.set(id, covering)
    })
  } else {
    chips.forEach((chip) =>
      tagsVocabulary.ancestors(chip).forEach(({ id }) => {
        if (!chipSet.has(id))
          coveringChips.set(id, [...(coveringChips.get(id) ?? []), chip])
      })
    )
  }

  const isInherited = (id: TagId) => id in inheritedTags
  const isCovered = (id: TagId) => coveringChips.has(id)

  const note = (id: TagId) => {
    if (isInherited(id)) return inheritedFrom(inheritedTags[id])
    const covering = coveringChips.get(id)
    if (!covering) return undefined
    const labels = covering.map(tagsVocabulary.label).join(', ')
    return isFilter ? `Included in ${labels}` : `Implied by ${labels}`
  }

  return { isInherited, isCovered, note }
}

export default useTagNotes
