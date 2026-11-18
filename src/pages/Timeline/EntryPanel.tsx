import type { FC } from 'react'

import { Drawer } from '@mui/material'
import type { EntryDraft } from 'utils/timeline'

import EntryForm, { type EntryFormProps } from './EntryForm'

type EntryPanelProps = Omit<EntryFormProps, 'draft'> & { draft?: EntryDraft }

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
