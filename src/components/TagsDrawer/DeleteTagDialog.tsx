import { type FC, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import type { Tag } from 'types/tags'
import {
  deleteRoot,
  deleteTag,
  otherRootId,
  rootTargets,
  type TagEdit,
  type TagsState,
  tagUsage,
} from 'utils/tags'

const useDeleteTagDialogStyles = makeStyles({ name: 'DeleteTagDialog' })(
  (theme) => ({
    dialog: {
      zIndex: theme.zIndex.modal + 1,
    },
    picker: {
      zIndex: theme.zIndex.modal + 2,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
    items: {
      margin: 0,
      paddingLeft: theme.spacing(2.5),
    },
  })
)

type DeleteTagDialogProps = {
  isPending: boolean
  onClose: () => void
  onConfirm: (edit: TagEdit) => void
  state: TagsState
  tag: Tag
}

const DeleteTagDialog: FC<DeleteTagDialogProps> = ({
  isPending,
  onClose,
  onConfirm,
  state,
  tag,
}) => {
  const { classes } = useDeleteTagDialogStyles()
  const targets = rootTargets(state.tagsList, tag.id)
  const [targetId, setTargetId] = useState(
    targets.some(({ id }) => id === otherRootId)
      ? otherRootId
      : (targets[0]?.id ?? '')
  )
  const { sets, minifigs } = tagUsage(state, [tag.id])
  const items = [
    ...sets.map(({ id, name }) => `Set ${id} ${name}`),
    ...minifigs.map(({ id, name }) => `Minifig ${id} ${name}`),
  ]
  const parentLabel = state.tagsList.find(({ id }) => id === tag.parent)?.label
  const hasChildren = state.tagsList.some(({ parent }) => parent === tag.id)
  const target = targets.find(({ id }) => id === targetId)
  const inheritanceChange =
    target &&
    hasChildren &&
    !!target.inherited !== !!tag.inherited &&
    `Minifigs will ${target.inherited ? 'start' : 'stop'} inheriting these tags from their sets.`

  return (
    <Dialog
      className={classes.dialog}
      maxWidth="sm"
      fullWidth
      onClose={() => !isPending && onClose()}
      open
    >
      <DialogTitle>{`Are you sure you want to delete ${tag.label}?`}</DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="body2">
          {[
            items.length
              ? `${items.length} items use it and will lose it.`
              : 'No item uses it.',
            hasChildren &&
              (tag.parent
                ? `Its tags move up to ${parentLabel}.`
                : 'Its tags move under another root and stay on their items.'),
          ]
            .filter(Boolean)
            .join(' ')}
        </Typography>
        {!!items.length && (
          <ul className={classes.items}>
            {items.map((item) => (
              <li key={item}>
                <Typography variant="body2">{item}</Typography>
              </li>
            ))}
          </ul>
        )}
        {!tag.parent && (
          <>
            {inheritanceChange && (
              <Typography variant="body2">{inheritanceChange}</Typography>
            )}
            <TextField
              label="Move its tags to"
              onChange={(event) => setTargetId(event.target.value)}
              select
              size="small"
              slotProps={{
                select: { MenuProps: { className: classes.picker } },
              }}
              value={targetId}
            >
              {targets.map(({ id, label }) => (
                <MenuItem key={id} value={id}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button loading={isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!tag.parent && !targetId}
          loading={isPending}
          onClick={() =>
            onConfirm(
              tag.parent
                ? deleteTag(state, tag.id)
                : deleteRoot(state, tag.id, targetId)
            )
          }
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteTagDialog
