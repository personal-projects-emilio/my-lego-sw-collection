import { type FC, useId } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message?: string
  confirmLabel: string
  isPending?: boolean
  onConfirm: () => void
  onClose: () => void
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  isPending = false,
  onConfirm,
  onClose,
}) => {
  const titleId = useId()
  return (
    <Dialog
      aria-labelledby={titleId}
      maxWidth="md"
      onClose={() => !isPending && onClose()}
      open={open}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      {message && (
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button color="primary" disabled={isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="error"
          loading={isPending}
          onClick={onConfirm}
          variant="contained"
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
