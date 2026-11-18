import { type Dispatch, type SetStateAction, useCallback, useMemo } from 'react'

import {
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { TagId } from 'types/tags'
import { moveTag, type TagsState } from 'utils/tags'
import { projectDrop } from 'utils/tree'

import { type Drag, indent, type Run } from './tagTree'
import type { TagTree } from './useTagTree'

type UseTagDragOptions = {
  state?: TagsState
  tree: TagTree
  run: Run
  drag?: Drag
  setDrag: Dispatch<SetStateAction<Drag | undefined>>
}

const useTagDrag = ({ state, tree, run, drag, setDrag }: UseTagDragOptions) => {
  const { nodes, tagsById, tagsVocabulary, fullPath, expand } = tree
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const projectSortedDrop = useCallback(
    (target: Required<Drag>) => {
      const projected = projectDrop({ nodes, ...target })
      return {
        ...projected,
        stays: projected.parent === tagsById.get(target.activeId)?.parent,
      }
    },
    [nodes, tagsById]
  )

  const drop = useMemo(() => {
    if (!state || !drag?.overId) return undefined
    const target = projectSortedDrop({ ...drag, overId: drag.overId })
    const edit = target.stays
      ? undefined
      : moveTag({ state, id: drag.activeId, parent: target.parent })
    return {
      ...target,
      depth: target.parent ? tagsVocabulary.depth(target.parent) + 1 : 0,
      refused: edit && 'refused' in edit ? edit.refused : undefined,
    }
  }, [state, drag, projectSortedDrop, tagsVocabulary])

  const dropNoteOf = (id: TagId) =>
    drop && id === drag?.activeId
      ? {
          refused: !!drop.refused,
          text:
            drop.refused ??
            `${drop.stays ? 'Stays in' : 'Into'} ${fullPath(drop.parent)}`,
        }
      : undefined

  const isDropTarget = (id: TagId) =>
    !!drop && !drop.refused && !drop.stays && drop.parent === id

  const onDragStart = ({ active }: DragStartEvent) =>
    setDrag({ activeId: String(active.id), depthDelta: 0 })

  const onDragMove = ({ active, over, delta }: DragMoveEvent) => {
    const overId = over ? String(over.id) : undefined
    const depthDelta = Math.round(delta.x / indent)
    setDrag((current) =>
      current && current.overId === overId && current.depthDelta === depthDelta
        ? current
        : { activeId: String(active.id), overId, depthDelta }
    )
  }

  const onDragEnd = ({ active, over, delta }: DragEndEvent) => {
    setDrag(undefined)
    const depthDelta = Math.round(delta.x / indent)
    if (!state || !over || (active.id === over.id && !depthDelta)) return
    const id = String(active.id)
    const target = projectSortedDrop({
      activeId: id,
      overId: String(over.id),
      depthDelta,
    })
    if (target.stays) return
    const edit = moveTag({ state, id, parent: target.parent })
    if ('state' in edit) expand(target.parent)
    run(
      edit,
      `Moved ${tagsVocabulary.label(id)} into ${fullPath(target.parent)}`
    )
  }

  return {
    drop,
    dropNoteOf,
    isDropTarget,
    contextProps: {
      sensors,
      onDragStart,
      onDragMove,
      onDragEnd,
      onDragCancel: () => setDrag(undefined),
    },
  }
}

export default useTagDrag
