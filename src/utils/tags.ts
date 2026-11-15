import type { InheritedTags, TagId, TagsList, TagTarget } from 'types/tags'

import { buildTree } from './tree'

export const seasonalTagId = 'seasonal'

const createTagsVocabulary = (tagsList: TagsList) => {
  const tree = buildTree(tagsList)

  const appliesTo = (id: TagId, target: TagTarget) => {
    const appliesTo = tree.rootOf(id)?.appliesTo
    return appliesTo === 'both' || appliesTo === target
  }

  const pickable = (target: TagTarget) =>
    tree.sort(
      tagsList
        .filter(({ id, parent }) => parent && appliesTo(id, target))
        .map(({ id }) => id)
    )

  return { ...tree, appliesTo, pickable }
}

export type TagsVocabulary = ReturnType<typeof createTagsVocabulary>

const vocabularies = new WeakMap<TagsList, TagsVocabulary>()

export const buildTagsVocabulary = (tagsList: TagsList) => {
  const cached = vocabularies.get(tagsList)
  if (cached) return cached
  const tagsVocabulary = createTagsVocabulary(tagsList)
  vocabularies.set(tagsList, tagsVocabulary)
  return tagsVocabulary
}

export const inheritedFrom = (sources: Array<string | number>) =>
  `Inherited from ${sources.join(', ')}`

type StoredPick = {
  picked: TagId[]
  stored: TagId[]
  inheritedTags: InheritedTags
}

export const storedTagsAfterPick = (
  tagsVocabulary: TagsVocabulary,
  { picked, stored, inheritedTags }: StoredPick
) => {
  const isInherited = (id: TagId) => id in inheritedTags
  return tagsVocabulary.leaves([
    ...picked.filter((id) => !isInherited(id) || stored.includes(id)),
    ...stored.filter(isInherited),
  ])
}

export const filterTagsAfterPick = (
  tagsVocabulary: TagsVocabulary,
  picked: TagId[]
) => tagsVocabulary.tops(picked)
