import { type FC, useId, useState } from 'react'

import {
  Alert,
  Button,
  Drawer,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { PartlySavedError } from 'hooks/useVocabularyMutations'
import { makeStyles } from 'tss-react/mui'
import type { Kind } from 'types/timeline'
import {
  deleteEntry,
  type EntryDraft,
  formatRange,
  kindName,
  kinds,
  saveEntry,
  type Timeline,
  type TimelineEdit,
} from 'utils/timeline'

import { countLabel, type Counts } from './counts'
import useTimelineMutations from './useTimelineMutations'

const useEntryPanelStyles = makeStyles({ name: 'EntryPanel' })((theme) => ({
  panel: {
    width: 340,
    maxWidth: '100vw',
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  muted: { color: theme.palette.text.secondary },
  warning: { color: theme.palette.error.main },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
  },
}))

type EntryPanelProps = {
  counts: Counts
  draft?: EntryDraft
  onClose: () => void
  timeline: Timeline
}

const toYear = (value: string) => (value === '' ? undefined : Number(value))

const saveError = (err: unknown) =>
  err instanceof PartlySavedError
    ? err.message
    : 'The change could not be saved'

const EntryForm: FC<EntryPanelProps & { draft: EntryDraft }> = ({
  counts,
  draft: initial,
  onClose,
  timeline,
}) => {
  const { classes } = useEntryPanelStyles()
  const titleId = useId()
  const { state, applyTimelineState, isPending } = useTimelineMutations()
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState<string>()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { id } = draft
  const isEdit = id !== undefined && timeline.has(id)
  const parents = [...timeline.eras, ...timeline.trilogies].filter(
    (candidate) =>
      !id ||
      (candidate.id !== id &&
        !timeline.ancestors(candidate.id).some((a) => a.id === id))
  )

  const run = (edit: (current: NonNullable<typeof state>) => TimelineEdit) => {
    if (!state) return
    const result = edit(state)
    if ('refused' in result) {
      setError(result.refused)
      return
    }
    setError(undefined)
    applyTimelineState(result.state)
      .then(onClose)
      .catch((err) => setError(saveError(err)))
  }

  return (
    <form
      aria-labelledby={titleId}
      className={classes.panel}
      onSubmit={(event) => {
        event.preventDefault()
        run((current) => saveEntry(current, draft))
      }}
    >
      <Typography id={titleId} variant="h6" component="h2">
        {isEdit ? 'Edit timeline entry' : 'New timeline entry'}
      </Typography>
      {isEdit && (
        <Typography variant="caption" className={classes.muted}>
          {countLabel(counts, id)}
        </Typography>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        autoFocus
        label="Label"
        required
        value={draft.label}
        onChange={(event) => setDraft({ ...draft, label: event.target.value })}
      />
      <TextField
        select
        label="Kind"
        value={draft.kind ?? ''}
        onChange={(event) =>
          setDraft({
            ...draft,
            kind: (event.target.value || undefined) as Kind | undefined,
          })
        }
        helperText="No kind for an era or a trilogy"
      >
        <MenuItem value="">None (era or trilogy)</MenuItem>
        {kinds.map((kind) => (
          <MenuItem key={kind} value={kind}>
            {kindName(kind)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Parent"
        value={draft.parent ?? ''}
        onChange={(event) =>
          setDraft({ ...draft, parent: event.target.value || undefined })
        }
      >
        <MenuItem value="">None</MenuItem>
        {parents.map((parent) => (
          <MenuItem key={parent.id} value={parent.id}>
            {timeline.pathLabel(parent.id)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="number"
        label="Start year"
        value={draft.start ?? ''}
        onChange={(event) =>
          setDraft({ ...draft, start: toYear(event.target.value) })
        }
        helperText="Negative for BBY"
      />
      <TextField
        type="number"
        label="End year"
        value={draft.end ?? ''}
        onChange={(event) =>
          setDraft({ ...draft, end: toYear(event.target.value) })
        }
        helperText={formatRange(draft)}
      />
      <div className={classes.actions}>
        {isEdit &&
          (confirmDelete ? (
            <Button
              color="error"
              variant="contained"
              loading={isPending}
              onClick={() => run((current) => deleteEntry(current, id))}
            >
              Confirm delete
            </Button>
          ) : (
            <Button color="error" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          ))}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          loading={isPending}
          disabled={!draft.label.trim() || !state}
        >
          Save
        </Button>
      </div>
      {confirmDelete && (
        <Typography variant="caption" className={classes.warning} role="alert">
          {id && counts.has(id)
            ? `Its children move up and it is removed from ${countLabel(counts, id)}.`
            : 'Its children move up.'}
        </Typography>
      )}
    </form>
  )
}

const EntryPanel: FC<EntryPanelProps> = ({ draft, onClose, ...props }) => (
  <Drawer anchor="right" open={!!draft} onClose={onClose}>
    {draft && (
      <EntryForm
        key={draft.id ?? 'new'}
        draft={draft}
        onClose={onClose}
        {...props}
      />
    )}
  </Drawer>
)

export default EntryPanel
