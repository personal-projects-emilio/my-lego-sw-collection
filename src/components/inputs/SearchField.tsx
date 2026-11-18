import { type FC, useRef } from 'react'
import { FaSearch } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'

import { IconButton, InputAdornment, TextField } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

type SearchFieldProps = {
  label?: string
  onChange: (value: string) => void
  value: string
}

const useSearchFieldStyles = makeStyles({ name: 'SearchField' })({
  hidden: { visibility: 'hidden' },
})

const SearchField: FC<SearchFieldProps> = ({
  label = 'Search',
  onChange,
  value,
}) => {
  const { classes } = useSearchFieldStyles()
  const inputRef = useRef<HTMLInputElement>(null)

  const clear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <TextField
      inputRef={inputRef}
      label={label}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && value) clear()
      }}
      size="small"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <FaSearch />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment
              position="end"
              className={value ? undefined : classes.hidden}
            >
              <IconButton
                aria-label={`Clear ${label.toLowerCase()}`}
                edge="end"
                onClick={clear}
                size="small"
              >
                <MdClose />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      value={value}
      variant="outlined"
    />
  )
}

export default SearchField
