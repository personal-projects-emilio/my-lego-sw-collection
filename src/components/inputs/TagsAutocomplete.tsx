import { forwardRef, useMemo } from 'react'

import {
  Autocomplete as MuiAutocomplete,
  Checkbox,
  Chip,
  TextField,
  type TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material'
import TagTree from 'components/TagTree'
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
    const explicit = [...value, ...Object.keys(inheritedTags)]
    const chips = vocabulary.leaves(explicit)
    const isInherited = (id: string) => id in inheritedTags
    const isStored = (id: string) => value.includes(id)
    const impliedBy = (id: string) =>
      chips.filter((chip) =>
        vocabulary.ancestors(chip).some((tag) => tag.id === id)
      )
    const isImplied = (id: string) =>
      !chips.includes(id) && impliedBy(id).length > 0

    const note = (id: string) => {
      if (isInherited(id))
        return `Inherited from ${inheritedTags[id].join(', ')}`
      if (isImplied(id))
        return `Implied by ${impliedBy(id).map(vocabulary.label).join(', ')}`
      return undefined
    }

    return (
      <MuiAutocomplete
        className={className}
        disableCloseOnSelect
        getOptionDisabled={(id) => isInherited(id) || isImplied(id)}
        getOptionLabel={vocabulary.pathLabel}
        groupBy={(id) => vocabulary.rootOf(id)?.label ?? ''}
        multiple
        onChange={(_event, ids) =>
          onChange(
            vocabulary.leaves([
              ...ids.filter((id) => !isInherited(id) || isStored(id)),
              ...value.filter(isInherited),
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
            <Checkbox checked={selected || isImplied(id)} size="small" />
            {vocabulary.label(id)}
            {note(id) && (
              <Typography
                sx={{ color: 'text.secondary', fontStyle: 'italic', ml: 1 }}
                variant="caption"
              >
                {note(id)}
              </Typography>
            )}
          </li>
        )}
        slotProps={{ popper: { className: popperClassName } }}
        renderValue={(ids, getItemProps) =>
          ids.map((id, index) => {
            const { key, onDelete, ...itemProps } = getItemProps({ index })
            const chipNote = note(id)
            return (
              <Tooltip
                key={key}
                title={
                  <TagTree
                    ids={[id]}
                    notes={chipNote ? { [id]: chipNote } : undefined}
                    vocabulary={vocabulary}
                  />
                }
              >
                <Chip
                  {...itemProps}
                  label={vocabulary.pathLabel(id)}
                  onDelete={isInherited(id) ? undefined : onDelete}
                  size="small"
                />
              </Tooltip>
            )
          })
        }
        value={chips}
      />
    )
  }
)

export default TagsAutocomplete
