import type { FC, MouseEvent } from 'react'
import { MdClose, MdToggleOff, MdToggleOn } from 'react-icons/md'

import { ButtonBase, IconButton, Tooltip, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

type FilterChipProps = {
  category: string
  editorId?: string
  isEditing: boolean
  isEnabled: boolean
  onDelete: () => void
  onEdit: (anchorElement: HTMLElement) => void
  onToggle: () => void
  value: string
}

const useFilterChipStyles = makeStyles({ name: 'FilterChip' })((theme) => ({
  chip: {
    alignItems: 'center',
    background: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 20,
    color: theme.palette.primary.contrastText,
    display: 'inline-flex',
    height: 40,
    maxWidth: 260,
    '&[data-enabled="false"]': {
      background: 'transparent',
      borderColor: theme.palette.divider,
      color: theme.palette.text.secondary,
    },
  },
  main: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    minWidth: 0,
    padding: theme.spacing(0, 0.5),
  },
  category: { lineHeight: 1.1, opacity: 0.8 },
  value: {
    lineHeight: 1.2,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '[data-enabled="false"] &': { textDecoration: 'line-through' },
  },
  iconButton: { color: 'inherit' },
}))

const FilterChip: FC<FilterChipProps> = ({
  category,
  editorId,
  isEditing,
  isEnabled,
  onDelete,
  onEdit,
  onToggle,
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
          {isEnabled ? <MdToggleOn /> : <MdToggleOff />}
        </IconButton>
      </Tooltip>
      <Tooltip title={`${category}: ${value}`}>
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
          <Typography className={classes.value} variant="body2">
            {value}
          </Typography>
        </ButtonBase>
      </Tooltip>
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
