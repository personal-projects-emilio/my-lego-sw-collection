import type { TagsList, TagTarget } from 'types/tags'

import { buildTree } from './tree'

export const seasonalTagId = 'seasonal'

export const buildTagsVocabulary = (tagsList: TagsList) => {
  const tree = buildTree(tagsList)

  const appliesTo = (id: string, target: TagTarget) => {
    const appliesTo = tree.rootOf(id)?.appliesTo
    return appliesTo === 'both' || appliesTo === target
  }

  const pickable = (target: TagTarget) =>
    tree.sort(
      tagsList
        .filter(({ id, parent }) => parent && appliesTo(id, target))
        .map(({ id }) => id)
    )

  return { ...tree, pickable }
}

export type TagsVocabulary = ReturnType<typeof buildTagsVocabulary>
