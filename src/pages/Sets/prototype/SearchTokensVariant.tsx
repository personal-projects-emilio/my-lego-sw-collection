import { type FC, useEffect, useId, useRef, useState } from 'react'

import { Autocomplete, Chip, Popover, TextField } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import FieldEditor from './FieldEditor'
import { type FilterToken, getTokenSuggestions } from './getTokenSuggestions'
import {
  emptySetsFilter,
  type FilterVariantProps,
  formatFieldValue,
  getActiveFields,
  getFieldLabel,
  type SetsFilterField,
} from './setsFilter'

const useSearchTokensStyles = makeStyles({ name: 'SearchTokensVariant' })(
  (theme) => ({
    bar: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
    },
    editor: { padding: theme.spacing(2), width: 360 },
  })
)

const SearchTokensVariant: FC<FilterVariantProps> = (props) => {
  const { filter, onChange, request, subthemeOptions } = props
  const { classes } = useSearchTokensStyles()
  const editorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [pendingField, setPendingField] = useState<SetsFilterField>()
  const [pickerField, setPickerField] = useState<SetsFilterField>()

  useEffect(() => {
    if (!request) return
    if (request.field === 'tags' || request.field === 'timeline')
      return setPickerField(request.field)
    setPendingField(request.field)
    inputRef.current?.focus()
  }, [request])

  const tokens: FilterToken[] = getActiveFields(filter).map((field) => ({
    key: field,
    field,
    label: `${getFieldLabel(field)}: ${formatFieldValue({ ...props, field })}`,
  }))

  return (
    <div className={classes.bar} role="search" aria-label="Filter sets">
      <Autocomplete
        multiple
        filterSelectedOptions={false}
        filterOptions={(options) => options}
        getOptionKey={(token) => token.key}
        getOptionLabel={(token) => token.label}
        inputValue={text}
        isOptionEqualToValue={(option, value) => option.key === value.key}
        onBlur={() => setPendingField(undefined)}
        onChange={(_event, _value, reason, details) => {
          const token = details?.option
          if (reason === 'clear') return onChange(emptySetsFilter)
          if (!token) return
          if (reason === 'removeOption')
            return onChange({
              ...filter,
              [token.field]: emptySetsFilter[token.field],
            })
          if (!token.apply) return setPickerField(token.field)
          onChange(token.apply(filter))
          setText('')
          setPendingField(undefined)
        }}
        onInputChange={(_event, value, reason) => {
          if (reason !== 'reset') setText(value)
        }}
        options={getTokenSuggestions({ pendingField, subthemeOptions, text })}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            label={
              pendingField
                ? `${getFieldLabel(pendingField)}: type a value`
                : 'Filter: type a name, ID, character, “owned”, a subtheme…'
            }
            size="small"
          />
        )}
        renderValue={(value, getItemProps) =>
          value.map((token, index) => (
            <Chip
              {...getItemProps({ index })}
              key={token.key}
              color="primary"
              label={token.label}
              onClick={() =>
                token.field === 'tags' || token.field === 'timeline'
                  ? setPickerField(token.field)
                  : setPendingField(token.field)
              }
              size="small"
            />
          ))
        }
        value={tokens}
      />
      <Popover
        anchorEl={inputRef.current}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={() => setPickerField(undefined)}
        open={!!pickerField}
        slotProps={{ paper: { id: editorId, role: 'dialog' } }}
      >
        {pickerField && (
          <div className={classes.editor}>
            <FieldEditor
              {...props}
              autoFocus
              field={pickerField}
              id={`${editorId}-${pickerField}`}
            />
          </div>
        )}
      </Popover>
    </div>
  )
}

export default SearchTokensVariant
