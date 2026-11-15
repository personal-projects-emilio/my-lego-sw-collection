import { forwardRef, useMemo } from 'react'

import {
  Autocomplete as MuiAutocomplete,
  Checkbox,
  Chip,
  TextField,
  type TextFieldProps,
  Tooltip,
} from '@mui/material'
import useVocabulary from 'hooks/useVocabulary'
import type { TagTarget } from 'types/tags'

type TagsAutocompleteProps = {
  className?: string
  inheritedTags?: Record<string, Array<string | number>>
  itemType: TagTarget
  onChange: (tags: string[]) => void
  popperClassName?: string
  textFieldProps?: Partial<TextFieldProps>
  value: string[]
}

const noInheritedTags: Record<string, Array<string | number>> = {}

const TagsAutocomplete = forwardRef<HTMLInputElement, TagsAutocompleteProps>(
  (
    {
      className,
      inheritedTags = noInheritedTags,
      itemType,
      onChange,
      popperClassName,
      textFieldProps,
      value,
    },
    ref
  ) => {
    const vocabulary = useVocabulary()
    const options = useMemo(
      () => vocabulary.pickable(itemType),
      [vocabulary, itemType]
    )
    const isLocked = (id: string) => id in inheritedTags
    const displayed = vocabulary.sort([...value, ...Object.keys(inheritedTags)])

    return (
      <MuiAutocomplete
        className={className}
        disableCloseOnSelect
        getOptionDisabled={isLocked}
        getOptionLabel={vocabulary.label}
        groupBy={(id) => vocabulary.rootOf(id)?.label ?? ''}
        multiple
        onChange={(_event, ids) =>
          onChange(
            vocabulary.sort([
              ...ids.filter((id) => !isLocked(id)),
              ...value.filter(isLocked),
            ])
          )
        }
        openOnFocus
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            ref={ref}
            variant="outlined"
            {...textFieldProps}
          />
        )}
        renderOption={({ key, ...props }, id, { selected }) => (
          <li
            key={key}
            {...props}
            style={{ paddingLeft: vocabulary.depth(id) * 16 }}
          >
            <Checkbox checked={selected || isLocked(id)} size="small" />
            {vocabulary.label(id)}
          </li>
        )}
        slotProps={{ popper: { className: popperClassName } }}
        renderValue={(ids, getItemProps) =>
          ids.map((id, index) => {
            const { key, onDelete, ...itemProps } = getItemProps({ index })
            const sources = inheritedTags[id]
            return sources ? (
              <Tooltip key={key} title={`Inherited from ${sources.join(', ')}`}>
                <Chip
                  {...itemProps}
                  label={vocabulary.label(id)}
                  size="small"
                />
              </Tooltip>
            ) : (
              <Chip
                key={key}
                {...itemProps}
                label={vocabulary.label(id)}
                onDelete={onDelete}
                size="small"
              />
            )
          })
        }
        value={displayed}
      />
    )
  }
)

export default TagsAutocomplete
