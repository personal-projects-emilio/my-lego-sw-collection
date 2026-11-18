import { memo } from 'react'
import { MdAdd, MdChevronRight, MdExpandMore, MdMoreVert } from 'react-icons/md'

import { IconButton, Tooltip, Typography } from '@mui/material'
import type { TagId } from 'types/tags'

import LabelInput from './LabelInput'
import useTagsDrawerStyles from './TagsDrawer.styles'
import type { RowActions } from './tagTree'

export type TagRowContentProps = {
  disabled: boolean
  details?: string
  dropNote?: { refused: boolean; text: string }
  editing: boolean
  expanded?: boolean
  id: TagId
  isRoot: boolean
  label: string
  rowActions: RowActions
  siblingLabels?: string[]
}

const TagRowContent = memo<TagRowContentProps>(
  ({
    details,
    dropNote,
    disabled,
    editing,
    expanded,
    id,
    isRoot,
    label,
    rowActions,
    siblingLabels = [],
  }) => {
    const { classes, cx } = useTagsDrawerStyles()
    return (
      <>
        {expanded === undefined ? (
          <span className={classes.toggleSpacer} />
        ) : (
          <IconButton
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
            onClick={() => rowActions.toggle(id)}
            size="small"
          >
            {expanded ? (
              <MdExpandMore fontSize="inherit" />
            ) : (
              <MdChevronRight fontSize="inherit" />
            )}
          </IconButton>
        )}
        {editing ? (
          <LabelInput
            className={classes.input}
            defaultValue={label}
            onCancel={rowActions.stopEditing}
            onCommit={(newLabel) => rowActions.rename(id, newLabel)}
            siblingLabels={siblingLabels}
          />
        ) : (
          <Typography
            className={cx(classes.name, isRoot && classes.root)}
            onDoubleClick={() => !disabled && rowActions.startRenaming(id)}
            variant="body2"
          >
            {label}
          </Typography>
        )}
        {dropNote ? (
          <Typography
            className={cx(
              classes.dropNote,
              dropNote.refused && classes.refused
            )}
            variant="caption"
          >
            {dropNote.text}
          </Typography>
        ) : (
          !editing &&
          details && (
            <Typography
              className={classes.details}
              color="textSecondary"
              title={details}
              variant="caption"
            >
              {details}
            </Typography>
          )
        )}
        <span className={classes.actions}>
          {!editing && (
            <Tooltip title={`Add a tag inside ${label}`}>
              <IconButton
                aria-label={`Add a tag inside ${label}`}
                className={classes.addButton}
                disabled={disabled}
                onClick={() => rowActions.add(id)}
                size="small"
              >
                <MdAdd fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            aria-label={`Actions for ${label}`}
            onClick={(event) => rowActions.menu(id, event.currentTarget)}
            size="small"
          >
            <MdMoreVert fontSize="inherit" />
          </IconButton>
        </span>
      </>
    )
  }
)

export default TagRowContent
