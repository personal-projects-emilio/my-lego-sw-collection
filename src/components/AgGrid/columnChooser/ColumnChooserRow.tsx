import type { FC } from 'react'
import { MdDragIndicator, MdLock } from 'react-icons/md'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox, FormControlLabel } from '@mui/material'
import type { ChooserColumn } from 'utils/columnLayout'

import useColumnChooserStyles from './ColumnChooser.styles'

type ColumnChooserRowProps = {
  column: ChooserColumn
  isDragDisabled: boolean
  onToggle: (visible: boolean) => void
}

const ColumnChooserRow: FC<ColumnChooserRowProps> = ({
  column,
  isDragDisabled,
  onToggle,
}) => {
  const { classes } = useColumnChooserStyles()
  const { colId, headerName, hide, isLockedPosition, isLockedVisible } = column
  const disabled = isDragDisabled || isLockedPosition
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ disabled, id: colId })

  return (
    <li
      ref={setNodeRef}
      className={classes.row}
      data-dragging={isDragging || undefined}
      style={{
        transform: CSS.Translate.toString(transform && { ...transform, x: 0 }),
        transition,
      }}
    >
      {isLockedPosition ? (
        <span
          aria-label={`${headerName} is locked`}
          className={classes.handle}
          data-disabled
          role="img"
        >
          <MdLock />
        </span>
      ) : (
        <span
          ref={setActivatorNodeRef}
          aria-label={`Move ${headerName}`}
          className={classes.handle}
          data-disabled={disabled || undefined}
          {...attributes}
          {...listeners}
        >
          <MdDragIndicator />
        </span>
      )}
      <FormControlLabel
        className={classes.checkboxLabel}
        control={
          <Checkbox
            checked={!hide}
            disabled={isLockedVisible}
            onChange={(event) => onToggle(event.target.checked)}
            size="small"
          />
        }
        label={headerName}
      />
    </li>
  )
}

export default ColumnChooserRow
