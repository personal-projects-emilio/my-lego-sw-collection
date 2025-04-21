import { type FC, useState } from 'react'
import { MdSync } from 'react-icons/md'

import { LoadingButton } from '@mui/lab'
import {
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
import type { Minifig } from 'types/minifigs'

export const SyncMinifigsButton: FC = () => {
  const [open, setOpen] = useState(false)
  const { data: setsList } = useSetsQuery()
  const { data: minifigsList } = useMinifigsQuery()
  const { editSetsList, isPending: isSetPending } = useSetsMutations()
  const { editMinifigsList, isPending: isMinifigPending } =
    useMinifigsMutations()

  const onClose = () => setOpen(false)
  const syncSetsAndMinifigs = async () => {
    if (!setsList || !minifigsList) return
    const cleanedMinifigsList = minifigsList.map((minifig) => ({
      ...minifig,
      owned: {
        total: minifig.owned.loose.quantity ?? 0,
        loose: minifig.owned.loose,
        inSet: [] as Minifig['owned']['inSet'],
      },
    }))
    const syncedList = setsList.reduce(
      ({ sets, minifigs }, currentSet) => {
        const updatedMinifigsList = [...minifigs]
        currentSet?.content?.minifigs?.forEach((setMinifig) => {
          const index = updatedMinifigsList.findIndex(
            ({ id }) => setMinifig.id === id
          )
          if (index === -1) return
          const currentMinifig = updatedMinifigsList[index]
          updatedMinifigsList[index] = {
            ...currentMinifig,
            possessed: currentSet.possessed ? true : currentMinifig.possessed,
            ...(!currentSet.tags?.includes('Seasonal') && {
              timelines: [
                ...new Set(
                  (currentSet.timelines ?? []).concat(
                    currentMinifig.timelines ?? []
                  )
                ),
              ].sort(),
              appearances: [
                ...new Set(
                  (currentSet.appearances ?? []).concat(
                    currentMinifig.appearances ?? []
                  )
                ),
              ].sort(),
            }),
            owned: {
              loose: currentMinifig.owned.loose,
              total: currentSet.possessed
                ? currentMinifig.owned.total + setMinifig.quantity
                : currentMinifig.owned.total,
              inSet: [
                ...currentMinifig.owned.inSet,
                {
                  quantity: setMinifig.quantity,
                  setId: currentSet.id,
                  isInFrame: setMinifig.isInFrame,
                },
              ],
            },
          }
        })
        return {
          sets: [
            ...sets,
            {
              ...currentSet,
              timelines: Array.from(new Set(currentSet.timelines)),
              tags: Array.from(new Set(currentSet.tags)),
              appearances: Array.from(new Set(currentSet.appearances)),
              ...(currentSet.content && {
                content: {
                  ...currentSet.content,
                  minifigs:
                    currentSet.content.minifigs?.map((minifig) => ({
                      ...minifig,
                      characterName:
                        updatedMinifigsList.find(({ id }) => id === minifig.id)
                          ?.characterName ?? minifig.characterName,
                    })) ?? [],
                },
              }),
            },
          ],
          minifigs: updatedMinifigsList,
        }
      },
      { sets: [] as typeof setsList, minifigs: cleanedMinifigsList }
    )
    await editSetsList(syncedList.sets)
    await editMinifigsList(syncedList.minifigs)
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
            <LoadingButton
              onClick={onClose}
              color="primary"
              loading={isSetPending || isMinifigPending}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              onClick={syncSetsAndMinifigs}
              color="primary"
              variant="contained"
              loading={isSetPending || isMinifigPending}
            >
              Sync sets/minifigs
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default SyncMinifigsButton
