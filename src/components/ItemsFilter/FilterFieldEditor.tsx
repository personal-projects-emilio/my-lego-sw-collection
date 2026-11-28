import type { FC, ReactNode } from 'react'

import {
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { TagsAutocomplete } from 'components/inputs'
import { TimelineField } from 'components/Timeline'
import type {
  FilterField,
  FilterOption,
  ItemsFilter,
  ListFilterField,
} from 'types/itemsFilter'
import type { TagTarget } from 'types/tags'
import { getFieldLabel, isListFilterField } from 'utils/itemsFilter'

type FilterFieldEditorProps = {
  field: FilterField
  filter: ItemsFilter
  id: string
  itemType?: TagTarget
  label?: ReactNode
  mapFieldsToOptions: Partial<Record<ListFilterField, FilterOption[]>>
  onChange: (filter: ItemsFilter) => void
}

const booleanChoices = [
  { value: 'any', label: 'Any' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const

const toChoice = (value: boolean | null) =>
  value === null ? 'any' : value ? 'yes' : 'no'

const FilterFieldEditor: FC<FilterFieldEditorProps> = ({
  field,
  filter,
  id,
  itemType,
  label = getFieldLabel(field),
  mapFieldsToOptions,
  onChange,
}) => {
  if (!isListFilterField(field))
    return (
      <div aria-labelledby={`${id}-label`} role="group">
        <Typography component="div" id={`${id}-label`} variant="caption">
          {label}
        </Typography>
        <ToggleButtonGroup
          exclusive
          onChange={(_event, choice: string | null) => {
            if (!choice) return
            onChange({
              ...filter,
              [field]: choice === 'any' ? null : choice === 'yes',
            })
          }}
          size="small"
          value={toChoice(filter[field])}
        >
          {booleanChoices.map((choice, index) => (
            <ToggleButton
              key={choice.value}
              id={index === 0 ? id : undefined}
              value={choice.value}
            >
              {choice.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    )

  if (field === 'tags' && itemType)
    return (
      <TagsAutocomplete
        itemType={itemType}
        mode="filter"
        onChange={(tags) => onChange({ ...filter, tags })}
        textFieldProps={{ id, label, size: 'small' }}
        value={filter.tags}
      />
    )

  if (field === 'timeline')
    return (
      <TimelineField
        label={label}
        onChange={(timeline) => onChange({ ...filter, timeline })}
        size="small"
        value={filter.timeline}
      />
    )

  const options = mapFieldsToOptions[field] ?? []
  const mapValuesToLabels = new Map(
    options.map((option) => [option.value, option.label])
  )
  return (
    <Autocomplete
      disableCloseOnSelect
      getOptionLabel={(value) => mapValuesToLabels.get(value) ?? value}
      multiple
      onChange={(_event, values) => onChange({ ...filter, [field]: values })}
      options={options.map(({ value }) => value)}
      renderInput={(params) => <TextField {...params} id={id} label={label} />}
      size="small"
      value={filter[field]}
    />
  )
}

export default FilterFieldEditor
