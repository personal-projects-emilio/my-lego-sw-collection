import type { CSSProperties, FC } from 'react'
import { MdDragIndicator } from 'react-icons/md'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import TagRowContent, { type TagRowContentProps } from './TagRowContent'
import useTagsDrawerStyles from './TagsDrawer.styles'

type TagRowProps = TagRowContentProps & {
  depth: number
  isDropTarget: boolean
}

const TagRow: FC<TagRowProps> = ({ depth, isDropTarget, ...content }) => {
  const { disabled } = content
  const { classes, cx } = useTagsDrawerStyles()
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ disabled, id: content.id })
  return (
    <li
      ref={setNodeRef}
      className={cx(
        classes.row,
        isDragging && classes.dragging,
        isDropTarget && classes.dropTarget
      )}
      style={
        {
          '--depth': depth,
          transform: CSS.Translate.toString(
            transform && { ...transform, x: 0 }
          ),
          transition,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        if (event.key === 'F2' && !disabled && !content.editing)
          content.rowActions.startRenaming(content.id)
      }}
    >
      <span
        ref={setActivatorNodeRef}
        aria-label={`Move ${content.label}`}
        className={classes.handle}
        {...attributes}
        {...listeners}
      >
        <MdDragIndicator />
      </span>
      <TagRowContent {...content} />
    </li>
  )
}

export default TagRow
