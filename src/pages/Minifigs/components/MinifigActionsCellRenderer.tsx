import { useState } from 'react'
import { MdContentCopy, MdDelete, MdEdit } from 'react-icons/md'

import LoadingButton from '@mui/lab/LoadingButton'
import {
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import type { CustomCellRendererProps } from 'ag-grid-react'
import type { Minifig } from 'types/minifigs'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

export type MinifigActionsCellRendererProps = {
  isPending: boolean
  deleteMinifig: (minifigId: Minifig['id']) => Promise<void>
}

const MinifigActionsCellRenderer = ({
  deleteMinifig,
  isPending,
  value: minifigId,
}: CustomCellRendererProps<Minifig, Minifig['id']> &
  MinifigActionsCellRendererProps) => {
  assert(isNotNullOrUndefined(minifigId))
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <Tooltip
        enterDelay={300}
        enterNextDelay={300}
        title={`Edit minifig ${minifigId}`}
      >
        <IconButton
          size="small"
          onClick={() => navigate({ to: `/minifigs/edit/${minifigId}` })}
        >
          <MdEdit fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip
        enterDelay={300}
        enterNextDelay={300}
        title={`Duplicate character appearances, character name, tags and timelines of minifig ${minifigId}`}
      >
        <IconButton
          size="small"
          onClick={() =>
            navigate({ to: '/minifigs/add', search: { duplicate: minifigId } })
          }
        >
          <MdContentCopy fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip
        enterDelay={300}
        enterNextDelay={300}
        title={`Delete minifig ${minifigId}`}
      >
        <IconButton size="small" onClick={() => setIsDeleteModalOpen(true)}>
          <MdDelete fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => {
          if (isPending) return
          setIsDeleteModalOpen(true)
        }}
        maxWidth="md"
      >
        <DialogTitle>{`Are you sure you want to delete ${minifigId}?`}</DialogTitle>
        <DialogActions>
          <LoadingButton
            color="primary"
            loading={isPending}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={isPending}
            onClick={() => deleteMinifig(minifigId)}
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MinifigActionsCellRenderer
