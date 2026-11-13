import { useMemo, useState } from 'react'
import { MdContentCopy, MdDelete, MdEdit } from 'react-icons/md'

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material'
import { type ToOptions, useNavigate } from '@tanstack/react-router'
import type { CustomCellRendererProps } from 'ag-grid-react'
import type { Item } from 'types/common'
import type { Minifig } from 'types/minifigs'
import type { ResaleSet } from 'types/resale'
import type { Set } from 'types/sets'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

type ItemsActionsCellSharedProps = {
  isPending: boolean
}

export type MinifigActionsCellRendererProps = ItemsActionsCellSharedProps & {
  variant: Extract<Item, 'minifig'>
  deleteItem: (itemId: Minifig['id']) => Promise<void>
}

export type SetActionsCellRendererProps = ItemsActionsCellSharedProps & {
  variant: Extract<Item, 'set'>
  deleteItem: (itemId: Set['id']) => Promise<void>
}

export type ResaleSetActionsCellRendererProps = ItemsActionsCellSharedProps & {
  variant: 'resale'
  deleteItem: (itemId: Set['id']) => Promise<void>
}

type ActionsCellRendererConstants = {
  addTo?: ToOptions
  duplicateTooltip?: string
  editTo: ToOptions
}

const getMinifigActionsCellRendererConstants = (minifigId: Minifig['id']) =>
  ({
    addTo: { to: '/minifigs/add', search: { duplicate: minifigId } },
    duplicateTooltip: `Duplicate appearances, character name, tags and timelines of minifig ${minifigId}`,
    editTo: { to: '/minifigs/edit/$minifigId', params: { minifigId } },
  }) as const satisfies ActionsCellRendererConstants

const getSetActionsCellRendererConstants = (setId: Set['id']) =>
  ({
    addTo: { to: '/sets/add', search: { duplicate: setId } },
    duplicateTooltip: `Duplicate appearances, subtheme, tags and timelines of set ${setId}`,
    editTo: { to: '/sets/edit/$setId', params: { setId } },
  }) as const satisfies ActionsCellRendererConstants

const getResaleSetActionsCellRendererConstants = (setId: Set['id']) =>
  ({
    editTo: { to: '/resale-sets/edit/$setId', params: { setId } },
  }) as const satisfies ActionsCellRendererConstants

const ItemActionsCellRenderer = ({
  deleteItem,
  isPending,
  value: itemId,
  variant,
}:
  | (CustomCellRendererProps<Set, Set['id']> & SetActionsCellRendererProps)
  | (CustomCellRendererProps<ResaleSet, Set['id']> &
      ResaleSetActionsCellRendererProps)
  | (CustomCellRendererProps<Minifig, Minifig['id']> &
      MinifigActionsCellRendererProps)) => {
  assert(isNotNullOrUndefined(itemId))
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const navigate = useNavigate()
  const { addTo, duplicateTooltip, editTo }: ActionsCellRendererConstants =
    useMemo(() => {
      if (variant === 'minifig')
        return getMinifigActionsCellRendererConstants(itemId)
      if (variant === 'resale')
        return getResaleSetActionsCellRendererConstants(itemId)
      return getSetActionsCellRendererConstants(itemId)
    }, [itemId, variant])

  return (
    <>
      <Tooltip enterDelay={300} enterNextDelay={300} title={`Edit ${itemId}`}>
        <IconButton size="small" onClick={() => navigate(editTo)}>
          <MdEdit fontSize="inherit" />
        </IconButton>
      </Tooltip>
      {addTo && (
        <Tooltip enterDelay={300} enterNextDelay={300} title={duplicateTooltip}>
          <IconButton size="small" onClick={() => navigate(addTo)}>
            <MdContentCopy fontSize="inherit" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip enterDelay={300} enterNextDelay={300} title={`Delete ${itemId}`}>
        <IconButton size="small" onClick={() => setIsDeleteModalOpen(true)}>
          <MdDelete fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => {
          if (isPending) return
          setIsDeleteModalOpen(false)
        }}
        maxWidth="md"
      >
        <DialogTitle>{`Are you sure you want to delete ${itemId}?`}</DialogTitle>
        <DialogActions>
          <Button
            color="primary"
            loading={isPending}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            loading={isPending}
            onClick={() =>
              variant === 'minifig' ? deleteItem(itemId) : deleteItem(itemId)
            }
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ItemActionsCellRenderer
