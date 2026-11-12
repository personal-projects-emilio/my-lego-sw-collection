import { type FC, useState } from 'react'
import { MdSync } from 'react-icons/md'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { useMinifigsMutations } from 'pages/Minifigs/hooks'
import { useSetsMutations } from 'pages/Sets/hooks'
import { syncSetsAndMinifigs } from 'utils/lego'

const SyncMinifigsButton: FC = () => {
  const [open, setOpen] = useState(false)
  const { data: initialSetsList } = useSetsQuery()
  const { data: initialMinifigsList } = useMinifigsQuery()
  const { editSetsList, isPending: isSetPending } = useSetsMutations()
  const { editMinifigsList, isPending: isMinifigPending } =
    useMinifigsMutations()

  const onClose = () => setOpen(false)
  const handleSync = async () => {
    if (!initialSetsList || !initialMinifigsList) return
    const { setsList, minifigsList } = syncSetsAndMinifigs({
      setsList: initialSetsList,
      minifigsList: initialMinifigsList,
    })
    await editSetsList(setsList)
    await editMinifigsList(minifigsList)
    onClose()
  }
  return (
    <>
      <Tooltip title="Synchronize sets and minifigs">
        <IconButton color="primary" onClick={() => setOpen(true)}>
          <MdSync />
        </IconButton>
      </Tooltip>
      {open && (
        <Dialog
          open
          onClose={onClose}
          aria-labelledby="set-sync-minifigs-dialog"
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle id="set-sync-minifigs-dialog">Sync minifigs</DialogTitle>
          <DialogContent dividers>
            This actions will iterate the sets to update the minfigs{' '}
            <code>owned.inSet</code> and make sure the{' '}
            <code>content.minifigs[number].characterName</code> are up to date
          </DialogContent>
          <DialogActions>
            <Button
              onClick={onClose}
              color="primary"
              loading={isSetPending || isMinifigPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSync}
              color="primary"
              variant="contained"
              loading={isSetPending || isMinifigPending}
            >
              Sync sets/minifigs
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default SyncMinifigsButton
