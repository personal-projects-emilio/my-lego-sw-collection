import { useCallback, useMemo, useState } from 'react'

import { useTagsVocabulary } from 'hooks'
import type { TagId, TagsList } from 'types/tags'
import type { FlatNode } from 'utils/tree'

const useTagTree = ({
  tagsList,
  activeId,
}: {
  tagsList: TagsList
  activeId?: TagId
}) => {
  const tagsVocabulary = useTagsVocabulary()
  const [expanded, setExpanded] = useState<ReadonlySet<TagId>>(new Set())

  const expand = useCallback(
    (id: TagId | undefined) =>
      id &&
      setExpanded(
        (ids) =>
          new Set([
            ...ids,
            ...tagsVocabulary.getAncestors(id).map((tag) => tag.id),
            id,
          ])
      ),
    [tagsVocabulary]
  )
  const toggle = useCallback(
    (id: TagId) =>
      setExpanded((ids) =>
        ids.has(id)
          ? new Set([...ids].filter((other) => other !== id))
          : new Set([...ids, id])
      ),
    []
  )

  const tagsById = useMemo(
    () => new Map(tagsList.map((tag) => [tag.id, tag])),
    [tagsList]
  )
  const parents = useMemo(
    () => new Set(tagsList.flatMap(({ parent }) => (parent ? [parent] : []))),
    [tagsList]
  )
  const descendants = useMemo(() => {
    const counts = new Map<TagId, number>()
    tagsList.forEach(({ id }) =>
      tagsVocabulary
        .getAncestors(id)
        .forEach((tag) => counts.set(tag.id, (counts.get(tag.id) ?? 0) + 1))
    )
    return counts
  }, [tagsList, tagsVocabulary])
  const draggedParent = activeId && parents.has(activeId) ? activeId : undefined
  const nodes = useMemo(
    (): FlatNode[] =>
      tagsVocabulary
        .sort(tagsList.map(({ id }) => id))
        .filter((id) =>
          tagsVocabulary
            .getAncestors(id)
            .every((tag) => tag.id !== draggedParent && expanded.has(tag.id))
        )
        .map((id) => ({
          id,
          parent: tagsById.get(id)?.parent,
          depth: tagsVocabulary.getDepth(id),
        })),
    [tagsVocabulary, tagsList, tagsById, draggedParent, expanded]
  )

  const getFullPath = (id: TagId | undefined) =>
    id
      ? [
          ...tagsVocabulary
            .getAncestors(id)
            .reverse()
            .map(({ label }) => label),
          tagsVocabulary.getLabel(id),
        ].join(' › ')
      : 'the top level'

  const getLabelsUnder = ({
    parent,
    except,
  }: {
    parent?: TagId
    except?: TagId
  }) =>
    tagsList
      .filter((tag) => tag.parent === parent && tag.id !== except)
      .map(({ label }) => label)

  return {
    tagsVocabulary,
    expanded,
    expand,
    toggle,
    expandAll: () => setExpanded(new Set(parents)),
    collapseAll: () => setExpanded(new Set()),
    tagsById,
    parents,
    descendants,
    nodes,
    getFullPath,
    getLabelsUnder,
  }
}

export type TagTree = ReturnType<typeof useTagTree>

export default useTagTree
