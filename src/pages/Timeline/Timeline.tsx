import { type FC, useMemo, useState } from 'react'
import { MdAdd } from 'react-icons/md'

import { Fab, Skeleton, Typography } from '@mui/material'
import { useCollection, useTimeline } from 'hooks'
import { useAuth } from 'providers/AuthProvider'
import { makeStyles } from 'tss-react/mui'
import type { EntryDraft } from 'utils/timeline'

import { countItems } from './counts'
import EntryPanel from './EntryPanel'
import TimelineEraSections from './TimelineEraSections'

const useTimelineStyles = makeStyles({ name: 'Timeline' })((theme) => ({
  root: {
    height: 'calc(100vh - 48px)',
    overflow: 'auto',
    position: 'relative',
  },
  heading: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
  },
  empty: { padding: theme.spacing(4), textAlign: 'center' },
  fab: { position: 'fixed', right: theme.spacing(3), bottom: theme.spacing(3) },
}))

const Timeline: FC = () => {
  const { classes } = useTimelineStyles()
  const { setsList, minifigsList, isLoading } = useCollection()
  const timeline = useTimeline()
  const { idToken } = useAuth()
  const [draft, setDraft] = useState<EntryDraft>()
  const counts = useMemo(
    () => countItems(setsList, minifigsList),
    [setsList, minifigsList]
  )

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  const isEmpty = !timeline.eras.length && !timeline.titles.length

  return (
    <main className={classes.root}>
      <Typography variant="h1" className={classes.heading}>
        Timeline
      </Typography>
      {isEmpty ? (
        <Typography className={classes.empty} color="text.secondary">
          The timeline is empty.
        </Typography>
      ) : (
        <TimelineEraSections
          timeline={timeline}
          counts={counts}
          onSelect={
            idToken
              ? (id) => {
                  const entry = timeline.entry(id)
                  if (entry) setDraft(entry)
                }
              : undefined
          }
        />
      )}
      {idToken && (
        <Fab
          aria-label="New timeline entry"
          className={classes.fab}
          color="primary"
          onClick={() => setDraft({ label: '', kind: 'movie' })}
        >
          <MdAdd />
        </Fab>
      )}
      <EntryPanel
        counts={counts}
        draft={draft}
        onClose={() => setDraft(undefined)}
        timeline={timeline}
      />
    </main>
  )
}

export default Timeline
