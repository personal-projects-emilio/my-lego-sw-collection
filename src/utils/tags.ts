import type { Tag, TagsList, TagTarget } from 'types/tags'

export const seasonalTagId = 'seasonal'

export type Vocabulary = ReturnType<typeof buildVocabulary>

type SiblingGroup = { parent: string | undefined; ids: string[] }

export const buildVocabulary = (tagsList: TagsList) => {
  const byId = new Map(tagsList.map((tag) => [tag.id, tag]))
  const children = new Map<string | undefined, Tag[]>()
  tagsList.forEach((tag) =>
    children.set(tag.parent, [...(children.get(tag.parent) ?? []), tag])
  )

  const position = new Map<string, number>()
  const walk = (parent: string | undefined) =>
    [...(children.get(parent) ?? [])]
      .sort((a, b) => a.order - b.order)
      .forEach((tag) => {
        position.set(tag.id, position.size)
        walk(tag.id)
      })
  walk(undefined)

  const ancestors = (id: string) => {
    const result: Tag[] = []
    let tag = byId.get(id)
    while (tag?.parent && !result.some(({ id }) => id === tag?.parent)) {
      tag = byId.get(tag.parent)
      if (tag) result.push(tag)
    }
    return result
  }

  const rootOf = (id: string) => {
    const chain = ancestors(id)
    return chain[chain.length - 1] ?? byId.get(id)
  }

  const depth = (id: string) => ancestors(id).length

  const sort = (ids: Iterable<string>) =>
    [...new Set(ids)].sort(
      (a, b) =>
        (position.get(a) ?? Infinity) - (position.get(b) ?? Infinity) ||
        a.localeCompare(b)
    )

  const withImplied = (ids: string[]) =>
    sort(
      ids.flatMap((id) => [
        id,
        ...ancestors(id)
          .filter(({ parent }) => parent)
          .map(({ id }) => id),
      ])
    )

  const appliesTo = (id: string, target: TagTarget) => {
    const appliesTo = rootOf(id)?.appliesTo
    return appliesTo === 'both' || appliesTo === target
  }

  const pickable = (target: TagTarget) =>
    sort(
      tagsList
        .filter(({ id, parent }) => parent && appliesTo(id, target))
        .map(({ id }) => id)
    )

  const label = (id: string) => byId.get(id)?.label ?? id

  const leaves = (ids: string[]) => {
    const implied = new Set(
      ids.flatMap((id) => ancestors(id).map(({ id }) => id))
    )
    return sort(ids.filter((id) => !implied.has(id)))
  }

  const pathLabel = (id: string) =>
    [
      ...ancestors(id)
        .filter(({ parent }) => parent)
        .reverse()
        .map(({ label }) => label),
      label(id),
    ].join(' › ')

  const siblingGroups = (ids: string[]): SiblingGroup[] => {
    const groups = new Map<string, SiblingGroup>()
    leaves(ids).forEach((id) => {
      const parent = byId.get(id)?.parent
      const shared = parent && byId.get(parent)?.parent ? parent : undefined
      const key = shared ?? id
      const group = groups.get(key) ?? { parent: shared, ids: [] }
      groups.set(key, { ...group, ids: [...group.ids, id] })
    })
    return [...groups.values()].flatMap((group) =>
      group.ids.length > 1 ? [group] : [{ parent: undefined, ids: group.ids }]
    )
  }

  const groupedLabel = (ids: string[]) =>
    siblingGroups(ids)
      .map(({ parent, ids }) =>
        parent
          ? `${pathLabel(parent)} › ${ids.map(label).join(', ')}`
          : pathLabel(ids[0])
      )
      .join('; ')

  const tree = (ids: string[]) =>
    sort(ids.flatMap((id) => [id, ...ancestors(id).map(({ id }) => id)])).map(
      (id) => ({ id, label: label(id), depth: depth(id) })
    )

  return {
    byId,
    ancestors,
    rootOf,
    depth,
    sort,
    withImplied,
    pickable,
    label,
    leaves,
    pathLabel,
    siblingGroups,
    groupedLabel,
    tree,
  }
}
