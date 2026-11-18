import { isEqual, omit } from 'lodash'
import type { VocabularyState } from 'types/common'
import type { InheritedTags, Tag, TagId, TagsList, TagTarget } from 'types/tags'

import { buildTree, byLabel } from './tree'

export const seasonalTagId = 'seasonal'

const createTagsVocabulary = (tagsList: TagsList) => {
  const tree = buildTree({ nodes: tagsList })

  const appliesTo = ({ id, target }: { id: TagId; target: TagTarget }) => {
    const appliesTo = tree.rootOf(id)?.appliesTo
    return appliesTo === 'both' || appliesTo === target
  }

  const pickable = (target: TagTarget) =>
    tree.sort(
      tagsList
        .filter(({ id, parent }) => parent && appliesTo({ id, target }))
        .map(({ id }) => id)
    )

  return { ...tree, appliesTo, pickable }
}

export type TagsVocabulary = ReturnType<typeof createTagsVocabulary>

const mapTagsListsToVocabularies = new WeakMap<TagsList, TagsVocabulary>()

export const buildTagsVocabulary = (tagsList: TagsList) => {
  const cached = mapTagsListsToVocabularies.get(tagsList)
  if (cached) return cached
  const tagsVocabulary = createTagsVocabulary(tagsList)
  mapTagsListsToVocabularies.set(tagsList, tagsVocabulary)
  return tagsVocabulary
}

export const inheritedFrom = (sources: Array<string | number>) =>
  `Inherited from ${sources.join(', ')}`

export const storedTagsAfterPick = ({
  tagsVocabulary,
  picked,
  stored,
  inheritedTags,
}: {
  tagsVocabulary: TagsVocabulary
  picked: TagId[]
  stored: TagId[]
  inheritedTags: InheritedTags
}) => {
  const isInherited = (id: TagId) => id in inheritedTags
  return tagsVocabulary.leaves([
    ...picked.filter((id) => !isInherited(id) || stored.includes(id)),
    ...stored.filter(isInherited),
  ])
}

export const filterTagsAfterPick = ({
  tagsVocabulary,
  picked,
}: {
  tagsVocabulary: TagsVocabulary
  picked: TagId[]
}) => tagsVocabulary.tops(picked)

export const otherRootId = 'other'

const protectedTagIds = [seasonalTagId, otherRootId]

export const isProtectedTag = (id: TagId) => protectedTagIds.includes(id)

type TaggedRecord = { tags?: TagId[] }

export type TagsState = VocabularyState<'tagsList', Tag>

export type TagEdit = { state: TagsState } | { refused: string }

type AppliesTo = Tag['appliesTo']

const covers = ({ root, target }: { root: AppliesTo; target: AppliesTo }) =>
  root === 'both' || root === target

const findTag = ({ tagsList, id }: { tagsList: TagsList; id?: TagId }) =>
  tagsList.find((tag) => tag.id === id)

export const subtree = ({
  tagsList,
  id,
}: {
  tagsList: TagsList
  id: TagId
}) => {
  const tree = buildTree({ nodes: tagsList })
  return tagsList
    .filter(
      (tag) =>
        tag.id === id ||
        tree.ancestors(tag.id).some((ancestor) => ancestor.id === id)
    )
    .map((tag) => tag.id)
}

export const tagUsage = ({
  state: { tagsList, setsList, minifigsList },
  ids,
}: {
  state: TagsState
  ids: TagId[]
}) => {
  const tree = buildTagsVocabulary(tagsList)
  const uses = ({ tags }: TaggedRecord) =>
    tags?.some((id) => ids.includes(id)) ?? false
  const passesOn = ({ tags }: TaggedRecord) =>
    tags?.some(
      (id) =>
        ids.includes(id) &&
        tree.rootOf(id)?.inherited &&
        tree.appliesTo({ id, target: 'minifigs' })
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

const refusesAppliesTo = ({
  state,
  id,
  appliesTo,
}: {
  state: TagsState
  id: TagId
  appliesTo: AppliesTo
}) => {
  const { sets, minifigs } = tagUsage({
    state,
    ids: subtree({ tagsList: state.tagsList, id }),
  })
  if (sets.length && !covers({ root: appliesTo, target: 'sets' }))
    return `${sets.length} sets use these tags`
  if (minifigs.length && !covers({ root: appliesTo, target: 'minifigs' }))
    return `${minifigs.length} minifigs use these tags`
  return undefined
}

const withParent = ({ tag, parent }: { tag: Tag; parent?: TagId }): Tag =>
  parent
    ? { ...omit(tag, ['appliesTo', 'inherited']), parent }
    : {
        ...omit(tag, ['parent']),
        appliesTo: tag.appliesTo ?? 'both',
        inherited: tag.inherited ?? false,
      }

const reparentChildren = ({
  tagsList,
  from,
  to,
}: {
  tagsList: TagsList
  from: TagId
  to?: TagId
}) =>
  tagsList.map((tag) =>
    tag.parent === from ? withParent({ tag, parent: to }) : tag
  )

export const uniqueId = ({
  list,
  label,
}: {
  list: Array<{ id: string }>
  label: string
}) => {
  const base =
    label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'tag'
  const ids = new Set(list.map(({ id }) => id))
  let id = base
  for (let suffix = 2; ids.has(id) || id in Object.prototype; suffix++)
    id = `${base}-${suffix}`
  return id
}

export const addTag = ({
  state,
  label,
  parent,
}: {
  state: TagsState
  label: string
  parent?: TagId
}): TagEdit => {
  const trimmed = label.trim()
  if (!trimmed) return { refused: 'A tag needs a label' }
  if (parent && !findTag({ tagsList: state.tagsList, id: parent }))
    return { refused: `Unknown parent ${parent}` }
  const tag = withParent({
    tag: {
      id: uniqueId({ list: state.tagsList, label: trimmed }),
      label: trimmed,
    },
    parent,
  })
  return { state: { ...state, tagsList: [...state.tagsList, tag] } }
}

export const editTag = ({
  state,
  id,
  changes,
}: {
  state: TagsState
  id: TagId
  changes: Partial<Pick<Tag, 'label' | 'appliesTo' | 'inherited'>>
}): TagEdit => {
  const tag = findTag({ tagsList: state.tagsList, id })
  if (!tag) return { refused: `Unknown tag ${id}` }
  const label = changes.label?.trim() ?? tag.label
  if (!label) return { refused: 'A tag needs a label' }
  if (tag.parent && ('appliesTo' in changes || 'inherited' in changes))
    return { refused: `Only roots apply to items or are inherited` }
  if (changes.appliesTo) {
    const refused = refusesAppliesTo({
      state,
      id,
      appliesTo: changes.appliesTo,
    })
    if (refused)
      return { refused: `${tag.label} must apply to them: ${refused}` }
  }
  return {
    state: {
      ...state,
      tagsList: state.tagsList.map((other) =>
        other.id === id ? { ...other, ...changes, label } : other
      ),
    },
  }
}

export const moveTag = ({
  state,
  id,
  parent,
}: {
  state: TagsState
  id: TagId
  parent?: TagId
}): TagEdit => {
  const { tagsList } = state
  const tag = findTag({ tagsList, id })
  if (!tag) return { refused: `Unknown tag ${id}` }
  if (parent && !findTag({ tagsList, id: parent }))
    return { refused: `Unknown parent ${parent}` }
  if (id === otherRootId && parent)
    return { refused: `${tag.label} must stay a root` }
  const tree = buildTree({ nodes: tagsList })
  if (
    parent &&
    (parent === id ||
      tree.ancestors(parent).some((ancestor) => ancestor.id === id))
  )
    return { refused: `${tag.label} can't move under itself` }
  const root = parent ? tree.rootOf(parent) : withParent({ tag })
  const refused = refusesAppliesTo({ state, id, appliesTo: root?.appliesTo })
  if (refused) return { refused: `${root?.label} doesn't apply: ${refused}` }
  return {
    state: {
      ...state,
      tagsList: tagsList.map((other) =>
        other.id === id ? withParent({ tag: other, parent }) : other
      ),
    },
  }
}

const withoutTag = <Item extends TaggedRecord>({
  items,
  id,
}: {
  items: Item[]
  id: TagId
}) =>
  items.some(({ tags }) => tags?.includes(id))
    ? items.map((item) =>
        item.tags?.includes(id)
          ? { ...item, tags: item.tags.filter((tag) => tag !== id) }
          : item
      )
    : items

export const deleteTag = ({
  state,
  id,
}: {
  state: TagsState
  id: TagId
}): TagEdit => {
  const tag = findTag({ tagsList: state.tagsList, id })
  if (!tag) return { refused: `Unknown tag ${id}` }
  if (isProtectedTag(id)) return { refused: `${tag.label} can't be deleted` }
  if (!tag.parent)
    return { refused: `Pick a root to move the tags of ${tag.label} to` }
  return {
    state: {
      tagsList: reparentChildren({
        tagsList: state.tagsList.filter((other) => other.id !== id),
        from: id,
        to: tag.parent,
      }),
      setsList: withoutTag({ items: state.setsList, id }),
      minifigsList: withoutTag({ items: state.minifigsList, id }),
    },
  }
}

const restoreTags = <Item extends TaggedRecord & { id: string | number }>({
  current,
  before,
  after,
  known,
}: {
  current: Item[]
  before: Item[]
  after: Item[]
  known: ReadonlySet<TagId>
}) => {
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

const restoreTagsList = ({
  current,
  before,
  after,
}: {
  current: TagsList
  before: TagsList
  after: TagsList
}) => {
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

export const undoTagEdit = ({
  current,
  before,
  after,
}: {
  current: TagsState
  before: TagsState
  after: TagsState
}): TagsState => {
  const tagsList = restoreTagsList({
    current: current.tagsList,
    before: before.tagsList,
    after: after.tagsList,
  })
  const known = new Set(tagsList.map(({ id }) => id))
  return {
    tagsList,
    setsList: restoreTags({
      current: current.setsList,
      before: before.setsList,
      after: after.setsList,
      known,
    }),
    minifigsList: restoreTags({
      current: current.minifigsList,
      before: before.minifigsList,
      after: after.minifigsList,
      known,
    }),
  }
}

export const rootTargets = ({
  tagsList,
  id,
}: {
  tagsList: TagsList
  id: TagId
}) => {
  const appliesTo = findTag({ tagsList, id })?.appliesTo
  return tagsList
    .filter(
      (tag) =>
        !tag.parent &&
        tag.id !== id &&
        covers({ root: tag.appliesTo, target: appliesTo })
    )
    .sort(byLabel)
}

export const deleteRoot = ({
  state,
  id,
  targetId = otherRootId,
}: {
  state: TagsState
  id: TagId
  targetId?: TagId
}): TagEdit => {
  const root = findTag({ tagsList: state.tagsList, id })
  if (!root || root.parent) return { refused: `${id} isn't a root` }
  if (isProtectedTag(id)) return { refused: `${root.label} can't be deleted` }
  if (
    !rootTargets({ tagsList: state.tagsList, id }).some(
      (target) => target.id === targetId
    )
  )
    return {
      refused: `${targetId} must be another root that applies to the same items`,
    }
  return {
    state: {
      tagsList: reparentChildren({
        tagsList: state.tagsList.filter((other) => other.id !== id),
        from: id,
        to: targetId,
      }),
      setsList: withoutTag({ items: state.setsList, id }),
      minifigsList: withoutTag({ items: state.minifigsList, id }),
    },
  }
}
