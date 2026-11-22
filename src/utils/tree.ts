export type TreeNode = {
  id: string
  label: string
  parent?: string
}

export const byLabel = (a: TreeNode, b: TreeNode) =>
  a.label.localeCompare(b.label, undefined, {
    numeric: true,
    sensitivity: 'base',
  })

type SiblingGroup = { parent: string | undefined; ids: string[] }

export const buildTree = <Node extends TreeNode>({
  nodes,
  compare = byLabel,
}: {
  nodes: Node[]
  compare?: (a: Node, b: Node) => number
}) => {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const children = new Map<string | undefined, Node[]>()
  nodes.forEach((node) =>
    children.set(node.parent, [...(children.get(node.parent) ?? []), node])
  )

  const position = new Map<string, number>()
  const walk = (parent: string | undefined) =>
    [...(children.get(parent) ?? [])].sort(compare).forEach((node) => {
      position.set(node.id, position.size)
      walk(node.id)
    })
  walk(undefined)

  const getAncestors = (id: string) => {
    const result: Node[] = []
    let node = byId.get(id)
    while (node?.parent && !result.some(({ id }) => id === node?.parent)) {
      node = byId.get(node.parent)
      if (node) result.push(node)
    }
    return result
  }

  const getRoot = (id: string) => {
    const chain = getAncestors(id)
    return chain[chain.length - 1] ?? byId.get(id)
  }

  const getDepth = (id: string) => getAncestors(id).length

  const sort = (ids: Iterable<string>) =>
    [...new Set(ids)].sort(
      (a, b) =>
        (position.get(a) ?? Infinity) - (position.get(b) ?? Infinity) ||
        a.localeCompare(b)
    )

  const addImplied = (ids: string[]) =>
    sort(
      ids.flatMap((id) => [
        id,
        ...getAncestors(id)
          .filter(({ parent }) => parent)
          .map(({ id }) => id),
      ])
    )

  const getLabel = (id: string) => byId.get(id)?.label ?? id

  const getLeaves = (ids: string[]) => {
    const implied = new Set(
      ids.flatMap((id) => getAncestors(id).map(({ id }) => id))
    )
    return sort(ids.filter((id) => !implied.has(id)))
  }

  const getTops = (ids: string[]) => {
    const picked = new Set(ids)
    return sort(
      ids.filter((id) => !getAncestors(id).some(({ id }) => picked.has(id)))
    )
  }

  const getPathLabel = (id: string) =>
    [
      ...getAncestors(id)
        .filter(({ parent }) => parent)
        .reverse()
        .map(({ label }) => label),
      getLabel(id),
    ].join(' › ')

  const getSiblingGroups = (ids: string[]): SiblingGroup[] => {
    const groups = new Map<string, SiblingGroup>()
    sort(ids).forEach((id) => {
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

  const getGroupedLabel = (ids: string[]) =>
    getSiblingGroups(getLeaves(ids))
      .map(({ parent, ids }) =>
        parent
          ? `${getPathLabel(parent)} › ${ids.map(getLabel).join(', ')}`
          : getPathLabel(ids[0])
      )
      .join(' | ')

  const getOutline = (ids: string[]) =>
    sort(
      ids.flatMap((id) => [id, ...getAncestors(id).map(({ id }) => id)])
    ).map((id) => ({ id, label: getLabel(id), parent: byId.get(id)?.parent }))

  return {
    getAncestors,
    getRoot,
    getDepth,
    sort,
    addImplied,
    getLabel,
    getLeaves,
    getTops,
    getPathLabel,
    getSiblingGroups,
    getGroupedLabel,
    getOutline,
  }
}

export type FlatNode = { id: string; parent?: string; depth: number }

export const getDropProjection = ({
  nodes,
  activeId,
  overId,
  depthDelta,
}: {
  nodes: FlatNode[]
  activeId: string
  overId: string
  depthDelta: number
}) => {
  const from = nodes.findIndex(({ id }) => id === activeId)
  const to = nodes.findIndex(({ id }) => id === overId)
  const moved = [...nodes]
  const [active] = moved.splice(from, 1)
  moved.splice(to, 0, active)
  const previous = moved[to - 1]
  const next = moved[to + 1]
  const depth = Math.min(
    Math.max(active.depth + depthDelta, next?.depth ?? 0),
    previous ? previous.depth + 1 : 0
  )
  const before = moved.slice(0, to)
  const parent =
    depth === 0
      ? undefined
      : depth > previous.depth
        ? previous.id
        : [...before].reverse().find((node) => node.depth === depth)?.parent
  return { parent }
}

export type TreeModel<Node extends TreeNode = TreeNode> = ReturnType<
  typeof buildTree<Node>
>
