import type { FC } from 'react'

import { MenuItem, TextField } from '@mui/material'
import type { TimelineEntry } from 'types/timeline'
import {
  type EntryDraft,
  formatRange,
  isKind,
  kindName,
  kinds,
  type Timeline,
} from 'utils/timeline'

type EntryFieldsProps = {
  draft: EntryDraft
  setDraft: (draft: EntryDraft) => void
  parents: TimelineEntry[]
  timeline: Timeline
}

const toYear = (value: string) => (value === '' ? undefined : Number(value))

const EntryFields: FC<EntryFieldsProps> = ({
  draft,
  setDraft,
  parents,
  timeline,
}) => (
  <>
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
          kind: isKind(event.target.value) ? event.target.value : undefined,
          ...(!event.target.value &&
            draft.parent &&
            timeline.entry(draft.parent)?.parent && { parent: undefined }),
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
  </>
)

export default EntryFields
