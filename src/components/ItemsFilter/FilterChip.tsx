import type { FC, MouseEvent, ReactNode } from 'react'
import { MdClose, MdVisibility, MdVisibilityOff } from 'react-icons/md'

import { ButtonBase, IconButton, Tooltip, Typography } from '@mui/material'
import OverflowTypography from 'components/OverflowTypography'

import useFilterChipStyles from './FilterChip.styles'

type FilterChipProps = {
  category: string
  editorId?: string
  isEditing: boolean
  isEnabled: boolean
  onDelete: () => void
  onEdit: (anchorElement: HTMLElement) => void
  onToggle: () => void
  tooltip?: ReactNode
  value: string
}

const FilterChip: FC<FilterChipProps> = ({
  category,
  editorId,
  isEditing,
  isEnabled,
  onDelete,
  onEdit,
  onToggle,
  tooltip,
  value,
}) => {
  const { classes } = useFilterChipStyles()
  return (
    <div
      aria-label={`${category} filter`}
      className={classes.chip}
      data-enabled={isEnabled}
      role="group"
    >
      <Tooltip
        title={isEnabled ? `Turn off ${category}` : `Turn on ${category}`}
      >
        <IconButton
          aria-label={`Apply ${category} filter`}
          aria-pressed={isEnabled}
          className={classes.iconButton}
          onClick={onToggle}
          size="small"
        >
          {isEnabled ? <MdVisibility /> : <MdVisibilityOff />}
        </IconButton>
      </Tooltip>
      <ButtonBase
        aria-controls={isEditing ? editorId : undefined}
        aria-expanded={isEditing}
        aria-haspopup="dialog"
        aria-label={`Edit ${category} filter: ${value}`}
        className={classes.main}
        onClick={(event: MouseEvent<HTMLElement>) =>
          onEdit(event.currentTarget.parentElement ?? event.currentTarget)
        }
      >
        <Typography className={classes.category} variant="caption">
          {category}
        </Typography>
        <OverflowTypography
          key={value}
          className={classes.value}
          tooltipTitle={tooltip}
          variant="body2"
        >
          {value}
        </OverflowTypography>
      </ButtonBase>
      <IconButton
        aria-label={`Remove ${category} filter`}
        className={classes.iconButton}
        onClick={onDelete}
        size="small"
      >
        <MdClose />
      </IconButton>
    </div>
  )
}

export default FilterChip
