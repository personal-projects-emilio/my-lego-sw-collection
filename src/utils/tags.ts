import { isEqual, omit } from 'lodash'
import type { VocabularyState } from 'types/common'
import type { InheritedTags, Tag, TagId, TagsList, TagTarget } from 'types/tags'

import { buildTree, byLabel } from './tree'

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

const protectedTagIds = [seasonalTagId, otherRootId]

export const isProtectedTag = (id: TagId) => protectedTagIds.includes(id)

type TaggedRecord = { tags?: TagId[] }

export type TagsState = VocabularyState<'tagsList', Tag>

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
  { tagsList, setsList, minifigsList }: TagsState,
  ids: TagId[]
) => {
  const tree = buildTagsVocabulary(tagsList)
  const uses = ({ tags }: TaggedRecord) =>
    tags?.some((id) => ids.includes(id)) ?? false
  const passesOn = ({ tags }: TaggedRecord) =>
    tags?.some(
      (id) =>
        ids.includes(id) &&
        tree.rootOf(id)?.inherited &&
        tree.appliesTo(id, 'minifigs')
    ) ?? false
  const sets = setsList.filter(uses)
  const inheriting = new Set(
    sets
      .filter(passesOn)
      .flatMap((set) => set.content?.minifigs?.map(({ id }) => id) ?? [])
  )
  return {
    sets,
    minifigs: minifigsList.filter(
      (minifig) => uses(minifig) || inheriting.has(minifig.id)
    ),
  }
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

const withParent = (tag: Tag, parent: TagId | undefined): Tag =>
  parent
    ? { ...omit(tag, ['appliesTo', 'inherited']), parent }
    : {
        ...omit(tag, ['parent']),
        appliesTo: tag.appliesTo ?? 'both',
        inherited: tag.inherited ?? false,
      }

const reparentChildren = (
  tagsList: TagsList,
  from: TagId,
  to: TagId | undefined
) => tagsList.map((tag) => (tag.parent === from ? withParent(tag, to) : tag))

export const uniqueId = (tagsList: Array<{ id: string }>, label: string) => {
  const base =
    label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'tag'
  const ids = new Set(tagsList.map(({ id }) => id))
  let id = base
  for (let n = 2; ids.has(id) || id in Object.prototype; n++)
    id = `${base}-${n}`
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
    { id: uniqueId(state.tagsList, trimmed), label: trimmed },
    parent
  )
  return { state: { ...state, tagsList: [...state.tagsList, tag] } }
}

export const editTag = (
  state: TagsState,
  id: TagId,
  changes: Partial<Pick<Tag, 'label' | 'appliesTo' | 'inherited'>>
): TagEdit => {
  const tag = findTag(state.tagsList, id)
  if (!tag) return { refused: `Unknown tag ${id}` }
  const label = changes.label?.trim() ?? tag.label
  if (!label) return { refused: 'A tag needs a label' }
  if (tag.parent && ('appliesTo' in changes || 'inherited' in changes))
    return { refused: `Only roots apply to items or are inherited` }
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
  { parent }: { parent?: TagId }
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
      tagsList: tagsList.map((t) => (t.id === id ? withParent(t, parent) : t)),
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
  return {
    state: {
      tagsList: reparentChildren(
        state.tagsList.filter((t) => t.id !== id),
        id,
        tag.parent
      ),
      setsList: withoutTag(state.setsList, id),
      minifigsList: withoutTag(state.minifigsList, id),
    },
  }
}

const restoreTags = <T extends TaggedRecord & { id: string | number }>(
  current: T[],
  { before, after }: { before: T[]; after: T[] },
  known: ReadonlySet<TagId>
) => {
  const beforeById = new Map(before.map((item) => [item.id, item]))
  const afterById = new Map(after.map((item) => [item.id, item]))
  let changed = false
  const restored = current.map((item) => {
    const had = beforeById.get(item.id)?.tags ?? []
    const has = afterById.get(item.id)?.tags ?? []
    const tags = item.tags ?? []
    const next = [
      ...tags.filter((id) => had.includes(id) || !has.includes(id)),
      ...had.filter((id) => !has.includes(id) && !tags.includes(id)),
    ].filter((id) => known.has(id))
    if (isEqual(next, tags)) return item
    changed = true
    return { ...item, tags: next }
  })
  return changed ? restored : current
}

const restoreTagsList = (
  current: TagsList,
  before: TagsList,
  after: TagsList
) => {
  const beforeById = new Map(before.map((tag) => [tag.id, tag]))
  const afterById = new Map(after.map((tag) => [tag.id, tag]))
  const changed = new Set(
    [
      ...before.filter((tag) => afterById.get(tag.id) !== tag),
      ...after.filter((tag) => beforeById.get(tag.id) !== tag),
    ].map(({ id }) => id)
  )
  const position = new Map(before.map(({ id }, index) => [id, index]))
  return [
    ...current.filter(({ id }) => !changed.has(id)),
    ...before.filter(({ id }) => changed.has(id)),
  ].sort(
    (a, b) =>
      (position.get(a.id) ?? before.length) -
      (position.get(b.id) ?? before.length)
  )
}

export const undoTagEdit = (
  current: TagsState,
  { before, after }: { before: TagsState; after: TagsState }
): TagsState => {
  const tagsList = restoreTagsList(
    current.tagsList,
    before.tagsList,
    after.tagsList
  )
  const known = new Set(tagsList.map(({ id }) => id))
  return {
    tagsList,
    setsList: restoreTags(
      current.setsList,
      { before: before.setsList, after: after.setsList },
      known
    ),
    minifigsList: restoreTags(
      current.minifigsList,
      { before: before.minifigsList, after: after.minifigsList },
      known
    ),
  }
}

export const rootTargets = (tagsList: TagsList, id: TagId) => {
  const appliesTo = findTag(tagsList, id)?.appliesTo
  return tagsList
    .filter(
      (tag) => !tag.parent && tag.id !== id && covers(tag.appliesTo, appliesTo)
    )
    .sort(byLabel)
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
      tagsList: reparentChildren(
        state.tagsList.filter((t) => t.id !== id),
        id,
        targetId
      ),
      setsList: withoutTag(state.setsList, id),
      minifigsList: withoutTag(state.minifigsList, id),
    },
  }
}
