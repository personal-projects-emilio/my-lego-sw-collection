import { type FC, type MouseEvent, useState } from 'react'
import { MdCheck, MdClose } from 'react-icons/md'

import { IconButton, InputAdornment, TextField } from '@mui/material'

type LabelInputProps = {
  className: string
  defaultValue?: string
  onCancel: () => void
  onCommit: (label: string) => void
  placeholder?: string
  siblingLabels: string[]
}

const normalized = (label: string) => label.trim().toLocaleLowerCase()

const LabelInput: FC<LabelInputProps> = ({
  className,
  defaultValue = '',
  onCancel,
  onCommit,
  placeholder = 'Tag label',
  siblingLabels,
}) => {
  const [value, setValue] = useState(defaultValue)
  const keepFocus = (event: MouseEvent) => event.preventDefault()
  const commit = () =>
    value.trim() && value !== defaultValue ? onCommit(value) : onCancel()
  const duplicate =
    !!value.trim() &&
    siblingLabels.some((label) => normalized(label) === normalized(value))
  return (
    <TextField
      autoFocus
      className={className}
      color={duplicate ? 'warning' : undefined}
      focused={duplicate || undefined}
      helperText={duplicate && 'Another tag here has this label'}
      onBlur={() => document.hasFocus() && onCancel()}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit()
        if (event.key === 'Escape') {
          event.stopPropagation()
          onCancel()
        }
      }}
      placeholder={placeholder}
      size="small"
      value={value}
      slotProps={{
        htmlInput: { 'aria-label': 'Tag label' },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Save the label"
                onClick={commit}
                onMouseDown={keepFocus}
                size="small"
              >
                <MdCheck fontSize="inherit" />
              </IconButton>
              <IconButton
                aria-label="Cancel"
                onClick={onCancel}
                onMouseDown={keepFocus}
                size="small"
              >
                <MdClose fontSize="inherit" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      variant="standard"
    />
  )
}

export default LabelInput
