import { type FC, useId, useState } from 'react'

import { Alert, Button, Typography } from '@mui/material'
import useVocabularyMutations, {
  PartlySavedError,
  timelineVocabularyConfig,
} from 'hooks/useVocabularyMutations'
import {
  deleteEntry,
  type EntryDraft,
  saveEntry,
  type Timeline,
  type TimelineEdit,
  type TimelineState,
} from 'utils/timeline'

import { countLabel, type Counts, plural } from './counts'
import EntryFields from './EntryFields'
import useEntryPanelStyles from './EntryPanel.styles'

export type EntryFormProps = {
  counts: Counts
  draft: EntryDraft
  onClose: () => void
  timeline: Timeline
}

const saveError = (error: unknown) =>
  error instanceof PartlySavedError
    ? error.message
    : 'The change could not be saved'

const EntryForm: FC<EntryFormProps> = ({
  counts,
  draft: initial,
  onClose,
  timeline,
}) => {
  const { classes } = useEntryPanelStyles()
  const titleId = useId()
  const { state, apply, isPending } = useVocabularyMutations(
    timelineVocabularyConfig
  )
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState<string>()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { id } = draft
  const picking = (items: Array<{ timeline?: string[] }> = []) =>
    items.filter((item) => id && item.timeline?.includes(id)).length
  const pickedBySets = picking(state?.setsList)
  const pickedByMinifigs = picking(state?.minifigsList)
  const isEdit = id !== undefined && timeline.has(id)
  const holdsTrilogies = !!id && timeline.holdsTrilogies(id)
  const parents = (
    draft.kind ? [...timeline.eras, ...timeline.trilogies] : timeline.eras
  ).filter(
    (candidate) =>
      !holdsTrilogies &&
      (!id ||
        (candidate.id !== id &&
          !timeline
            .ancestors(candidate.id)
            .some((ancestor) => ancestor.id === id)))
  )

  const run = (edit: (current: TimelineState) => TimelineEdit) => {
    if (!state) return
    const result = edit(state)
    if ('refused' in result) {
      setError(result.refused)
      return
    }
    setError(undefined)
    apply(result.state)
      .then(onClose)
      .catch((cause) => setError(saveError(cause)))
  }

  return (
    <form
      aria-labelledby={titleId}
      className={classes.panel}
      onSubmit={(event) => {
        event.preventDefault()
        run((current) => saveEntry({ state: current, draft }))
      }}
    >
      <Typography id={titleId} variant="h6" component="h2">
        {isEdit ? 'Edit timeline entry' : 'New timeline entry'}
      </Typography>
      {isEdit && (
        <Typography variant="caption" className={classes.muted}>
          {countLabel({ counts, id })}
        </Typography>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <EntryFields
        draft={draft}
        setDraft={setDraft}
        parents={parents}
        timeline={timeline}
      />
      <div className={classes.actions}>
        {isEdit &&
          (confirmDelete ? (
            <Button
              color="error"
              variant="contained"
              loading={isPending}
              disabled={!state}
              onClick={() =>
                run((current) => deleteEntry({ state: current, id }))
              }
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
          {[
            holdsTrilogies
              ? 'Its trilogies become eras.'
              : 'Its children move up.',
            (pickedBySets || pickedByMinifigs) &&
              `It is removed from ${plural({ count: pickedBySets, noun: 'set' })} · ${plural({ count: pickedByMinifigs, noun: 'minifig' })}.`,
          ]
            .filter(Boolean)
            .join(' ')}
        </Typography>
      )}
    </form>
  )
}

export default EntryForm
