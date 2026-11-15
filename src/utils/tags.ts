import { omit } from 'lodash'
import type { MinifigsList } from 'types/minifigs'
import type { SetsList } from 'types/sets'
import type { InheritedTags, Tag, TagId, TagsList, TagTarget } from 'types/tags'

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

export const otherRootId = 'other'

export const timelineRootId = 'timeline'

const protectedTagIds = [seasonalTagId, otherRootId]

export const isProtectedTag = (id: TagId) => protectedTagIds.includes(id)

type TaggedRecord = { tags?: TagId[] }

export type TagsState = {
  tagsList: TagsList
  setsList: SetsList
  minifigsList: MinifigsList
}

export type TagEdit = { state: TagsState } | { refused: string }

type AppliesTo = Tag['appliesTo']

const covers = (root: AppliesTo, target: AppliesTo) =>
  root === 'both' || root === target

const findTag = (tagsList: TagsList, id: TagId | undefined) =>
  tagsList.find((tag) => tag.id === id)

export const subtree = (tagsList: TagsList, id: TagId) => {
  const tree = buildTree(tagsList)
  return tagsList
    .filter(
      (tag) => tag.id === id || tree.ancestors(tag.id).some((a) => a.id === id)
    )
    .map((tag) => tag.id)
}

export const tagUsage = (
  { setsList, minifigsList }: Pick<TagsState, 'setsList' | 'minifigsList'>,
  ids: TagId[]
) => {
  const uses = ({ tags }: TaggedRecord) =>
    tags?.some((id) => ids.includes(id)) ?? false
  return { sets: setsList.filter(uses), minifigs: minifigsList.filter(uses) }
}

const refusesAppliesTo = (
  state: TagsState,
  id: TagId,
  appliesTo: AppliesTo
) => {
  const { sets, minifigs } = tagUsage(state, subtree(state.tagsList, id))
  if (sets.length && !covers(appliesTo, 'sets'))
    return `${sets.length} sets use these tags`
  if (minifigs.length && !covers(appliesTo, 'minifigs'))
    return `${minifigs.length} minifigs use these tags`
  return undefined
}

const sortedChildren = (tagsList: TagsList, parent: TagId | undefined) =>
  tagsList
    .filter((tag) => tag.parent === parent)
    .sort((a, b) => a.order - b.order)
    .map(({ id }) => id)

const withParent = (tag: Tag, parent: TagId | undefined): Tag =>
  parent
    ? { ...omit(tag, ['appliesTo', 'inherited']), parent }
    : {
        ...omit(tag, ['parent']),
        appliesTo: tag.appliesTo ?? 'both',
        inherited: tag.inherited ?? false,
      }

const reparent = (
  tagsList: TagsList,
  parent: TagId | undefined,
  ids: TagId[]
) => {
  const order = new Map(ids.map((id, index) => [id, index]))
  return tagsList.map((tag) => {
    const position = order.get(tag.id)
    if (position === undefined) return tag
    if (tag.parent === parent && tag.order === position) return tag
    return { ...withParent(tag, parent), order: position }
  })
}

const placeAt = (tagsList: TagsList, moved: Tag, index: number) => {
  const siblings = sortedChildren(tagsList, moved.parent).filter(
    (id) => id !== moved.id
  )
  siblings.splice(index, 0, moved.id)
  const list = findTag(tagsList, moved.id)
    ? tagsList.map((tag) => (tag.id === moved.id ? moved : tag))
    : [...tagsList, moved]
  return reparent(list, moved.parent, siblings)
}

const uniqueId = (tagsList: TagsList, label: string) => {
  const base =
    label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'tag'
  const ids = new Set(tagsList.map(({ id }) => id))
  let id = base
  for (let n = 2; ids.has(id); n++) id = `${base}-${n}`
  return id
}

export const addTag = (
  state: TagsState,
  { label, parent }: { label: string; parent?: TagId }
): TagEdit => {
  const trimmed = label.trim()
  if (!trimmed) return { refused: 'A tag needs a label' }
  if (parent && !findTag(state.tagsList, parent))
    return { refused: `Unknown parent ${parent}` }
  const tag = withParent(
    { id: uniqueId(state.tagsList, trimmed), label: trimmed, order: 0 },
    parent
  )
  const index = sortedChildren(state.tagsList, parent).length
  return { state: { ...state, tagsList: placeAt(state.tagsList, tag, index) } }
}

export const editTag = (
  state: TagsState,
  id: TagId,
  changes: Partial<Pick<Tag, 'label' | 'kind' | 'appliesTo' | 'inherited'>>
): TagEdit => {
  const tag = findTag(state.tagsList, id)
  if (!tag) return { refused: `Unknown tag ${id}` }
  const label = changes.label?.trim() ?? tag.label
  if (!label) return { refused: 'A tag needs a label' }
  if (changes.appliesTo) {
    const refused = refusesAppliesTo(state, id, changes.appliesTo)
    if (refused)
      return { refused: `${tag.label} must apply to them: ${refused}` }
  }
  return {
    state: {
      ...state,
      tagsList: state.tagsList.map((t) =>
        t.id === id ? { ...t, ...changes, label } : t
      ),
    },
  }
}

export const moveTag = (
  state: TagsState,
  id: TagId,
  { parent, index }: { parent?: TagId; index: number }
): TagEdit => {
  const { tagsList } = state
  const tag = findTag(tagsList, id)
  if (!tag) return { refused: `Unknown tag ${id}` }
  if (parent && !findTag(tagsList, parent))
    return { refused: `Unknown parent ${parent}` }
  if (id === otherRootId && parent)
    return { refused: `${tag.label} must stay a root` }
  const tree = buildTree(tagsList)
  if (
    parent &&
    (parent === id || tree.ancestors(parent).some((a) => a.id === id))
  )
    return { refused: `${tag.label} can't move under itself` }
  const root = parent ? tree.rootOf(parent) : withParent(tag, undefined)
  const refused = refusesAppliesTo(state, id, root?.appliesTo)
  if (refused) return { refused: `${root?.label} doesn't apply: ${refused}` }
  return {
    state: {
      ...state,
      tagsList: placeAt(tagsList, withParent(tag, parent), index),
    },
  }
}

const withoutTag = <T extends TaggedRecord>(items: T[], id: TagId) =>
  items.some(({ tags }) => tags?.includes(id))
    ? items.map((item) =>
        item.tags?.includes(id)
          ? { ...item, tags: item.tags.filter((t) => t !== id) }
          : item
      )
    : items

export const deleteTag = (state: TagsState, id: TagId): TagEdit => {
  const tag = findTag(state.tagsList, id)
  if (!tag) return { refused: `Unknown tag ${id}` }
  if (isProtectedTag(id)) return { refused: `${tag.label} can't be deleted` }
  if (!tag.parent)
    return { refused: `Pick a root to move the tags of ${tag.label} to` }
  const siblings = sortedChildren(state.tagsList, tag.parent).flatMap((s) =>
    s === id ? sortedChildren(state.tagsList, id) : [s]
  )
  return {
    state: {
      tagsList: reparent(
        state.tagsList.filter((t) => t.id !== id),
        tag.parent,
        siblings
      ),
      setsList: withoutTag(state.setsList, id),
      minifigsList: withoutTag(state.minifigsList, id),
    },
  }
}

const restoreTags = <T extends TaggedRecord & { id: string | number }>(
  current: T[],
  before: T[],
  after: T[]
) => {
  if (before === after) return current
  const beforeById = new Map(before.map((item) => [item.id, item]))
  const changed = new Set(
    after.filter((item) => beforeById.get(item.id) !== item).map((i) => i.id)
  )
  return current.map((item) =>
    changed.has(item.id)
      ? { ...item, tags: beforeById.get(item.id)?.tags ?? [] }
      : item
  )
}

export const undoTagEdit = (
  current: TagsState,
  { before, after }: { before: TagsState; after: TagsState }
): TagsState => ({
  tagsList: before.tagsList,
  setsList: restoreTags(current.setsList, before.setsList, after.setsList),
  minifigsList: restoreTags(
    current.minifigsList,
    before.minifigsList,
    after.minifigsList
  ),
})

export const rootTargets = (tagsList: TagsList, id: TagId) => {
  const appliesTo = findTag(tagsList, id)?.appliesTo
  return tagsList
    .filter(
      (tag) => !tag.parent && tag.id !== id && covers(tag.appliesTo, appliesTo)
    )
    .sort((a, b) => a.order - b.order)
}

export const deleteRoot = (
  state: TagsState,
  id: TagId,
  targetId: TagId = otherRootId
): TagEdit => {
  const root = findTag(state.tagsList, id)
  if (!root || root.parent) return { refused: `${id} isn't a root` }
  if (isProtectedTag(id)) return { refused: `${root.label} can't be deleted` }
  if (!rootTargets(state.tagsList, id).some((t) => t.id === targetId))
    return {
      refused: `${targetId} must be another root that applies to the same items`,
    }
  return {
    state: {
      ...state,
      tagsList: reparent(
        state.tagsList.filter((t) => t.id !== id),
        targetId,
        [
          ...sortedChildren(state.tagsList, targetId),
          ...sortedChildren(state.tagsList, id),
        ]
      ),
    },
  }
}
