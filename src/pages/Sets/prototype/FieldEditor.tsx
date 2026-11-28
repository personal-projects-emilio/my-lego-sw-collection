import type { FC } from 'react'

import {
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { TagsAutocomplete } from 'components/inputs'
import { TimelineField } from 'components/Timeline'

import {
  type FilterOption,
  getFieldLabel,
  type ListFilterField,
  listFilterFields,
  type SetsFilter,
  type SetsFilterField,
} from './setsFilter'

export type FieldEditorProps = {
  autoFocus?: boolean
  field: SetsFilterField
  filter: SetsFilter
  id: string
  label?: string
  onChange: (filter: SetsFilter) => void
  mapFieldsToOptions: Record<ListFilterField, FilterOption[]>
}

const booleanChoices = [
  { value: 'any', label: 'Any' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const

const toChoice = (value: boolean | null) =>
  value === null ? 'any' : value ? 'yes' : 'no'

const FieldEditor: FC<FieldEditorProps> = ({
  autoFocus,
  field,
  filter,
  id,
  label: labelOverride,
  mapFieldsToOptions,
  onChange,
}) => {
  const label = labelOverride ?? getFieldLabel(field)

  if (field === 'owned' || field === 'retired')
    return (
      <div role="group" aria-labelledby={`${id}-label`}>
        <Typography id={`${id}-label`} variant="caption" component="div">
          {label}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={toChoice(filter[field])}
          onChange={(_event, choice: string | null) => {
            if (!choice) return
            onChange({
              ...filter,
              [field]: choice === 'any' ? null : choice === 'yes',
            })
          }}
        >
          {booleanChoices.map((choice, index) => (
            <ToggleButton
              key={choice.value}
              autoFocus={autoFocus && index === 0}
              id={index === 0 ? id : undefined}
              value={choice.value}
            >
              {choice.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    )

  const listField = listFilterFields.find((candidate) => candidate === field)
  if (listField) {
    const options = mapFieldsToOptions[listField]
    const mapValuesToLabels = new Map(
      options.map((option) => [option.value, option.label])
    )
    return (
      <Autocomplete
        disableCloseOnSelect
        getOptionLabel={(value) => mapValuesToLabels.get(value) ?? value}
        multiple
        size="small"
        options={options.map(({ value }) => value)}
        value={filter[listField]}
        onChange={(_event, values) =>
          onChange({ ...filter, [listField]: values })
        }
        renderInput={(params) => (
          <TextField {...params} autoFocus={autoFocus} id={id} label={label} />
        )}
      />
    )
  }

  if (field === 'tags')
    return (
      <TagsAutocomplete
        itemType="sets"
        mode="filter"
        value={filter.tags}
        onChange={(tags) => onChange({ ...filter, tags })}
        textFieldProps={{ autoFocus, id, label, size: 'small' }}
      />
    )

  if (field === 'timeline')
    return (
      <TimelineField
        label={label}
        size="small"
        value={filter.timeline}
        onChange={(timeline) => onChange({ ...filter, timeline })}
      />
    )

  return (
    <TextField
      autoFocus={autoFocus}
      fullWidth
      id={id}
      label={label}
      size="small"
      type="search"
      value={filter[field]}
      onChange={(event) => onChange({ ...filter, [field]: event.target.value })}
    />
  )
}

export default FieldEditor
