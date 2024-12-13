import { forwardRef, useCallback, useEffect, useState } from 'react'

import {
  Autocomplete as MuiAutocomplete,
  type AutocompleteProps as MuiAutocompleteProps,
  createFilterOptions,
  type TextFieldProps,
} from '@mui/material'
import TextField from '@mui/material/TextField'
import { uniqueAndSortedArray } from 'utils/array'
import { isNotNullOrUndefined } from 'utils/typescript'

const filter = createFilterOptions<string>()

type AutocompleteProps = Omit<
  MuiAutocompleteProps<string, boolean, boolean, boolean>,
  'renderInput' | 'onChange'
> & {
  onChange: (newValue: string | string[] | null) => void
  textFieldProps?: Partial<TextFieldProps>
}

const asNoValue = (option: string | string[] | null | undefined): boolean =>
  !isNotNullOrUndefined(option) ||
  (Array.isArray(option) && option.length === 0)

const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    { multiple, options, freeSolo, value, textFieldProps, onChange, ...rest },
    ref
  ) => {
    const [optionValue, setOptionValue] = useState<AutocompleteProps['value']>(
      value ?? (multiple ? [] : null)
    )

    useEffect(() => {
      if (value === optionValue) return
      setOptionValue(value)
    }, [optionValue, value])

    const onChangeHandler = useCallback(
      (newValue: string | string[] | null | undefined) => {
        setOptionValue(newValue)
        if (Array.isArray(newValue)) {
          return onChange(uniqueAndSortedArray(newValue))
        }
        onChange(newValue || null)
      },
      [onChange]
    )

    const getOptiondDisabled = useCallback(
      (option: string) => {
        if (!value) return false
        if (Array.isArray(value)) {
          return value.includes(option)
        }
        return value === option
      },
      [value]
    )

    return (
      <MuiAutocomplete
        {...rest}
        multiple={multiple}
        options={options}
        value={optionValue}
        autoHighlight
        freeSolo={freeSolo}
        openOnFocus
        onChange={(_e, value) => {
          onChangeHandler(value)
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params)
          const trimedInputValue = params.inputValue.trim()
          // Suggest the creation of a new value only if it does not exist in the options or newly created values
          if (
            trimedInputValue !== '' &&
            freeSolo &&
            ((Array.isArray(optionValue) &&
              !optionValue.find((option) => option === trimedInputValue) &&
              !options.find((option) => option === trimedInputValue)) ||
              !Array.isArray(optionValue))
          ) {
            filtered.push(trimedInputValue)
          }
          return filtered
        }}
        getOptionDisabled={getOptiondDisabled}
        renderInput={(params) => (
          <TextField
            {...params}
            ref={ref}
            variant="outlined"
            {...textFieldProps}
            placeholder={
              asNoValue(optionValue) ? textFieldProps?.placeholder : undefined
            }
          />
        )}
      />
    )
  }
)

export default Autocomplete
