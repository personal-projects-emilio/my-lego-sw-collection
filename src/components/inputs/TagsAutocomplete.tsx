import { forwardRef, useMemo } from 'react'

import {
  Autocomplete as MuiAutocomplete,
  Box,
  Checkbox,
  Chip,
  TextField,
  type TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material'
import useVocabulary from 'hooks/useVocabulary'
import type { TagTarget } from 'types/tags'
import type { Vocabulary } from 'utils/tags'

type TagsAutocompleteProps = {
  className?: string
  hideImplied?: boolean
  inheritedTags?: Record<string, Array<string | number>>
  itemType: TagTarget
  onChange: (tags: string[]) => void
  popperClassName?: string
  textFieldProps?: Partial<TextFieldProps>
  value: string[]
}

const noInheritedTags: Record<string, Array<string | number>> = {}

const TagPath = ({
  id,
  note,
  vocabulary,
}: {
  id: string
  note?: string
  vocabulary: Vocabulary
}) => (
  <Box>
    {[...vocabulary.ancestors(id).reverse(), vocabulary.byId.get(id)].map(
      (tag, depth) =>
        tag && (
          <Typography
            key={tag.id}
            sx={{
              display: 'block',
              fontWeight: tag.id === id ? 700 : 400,
              pl: depth * 1.5,
            }}
            variant="caption"
          >
            {tag.label}
          </Typography>
        )
    )}
    {note && (
      <Typography
        sx={{ display: 'block', fontStyle: 'italic', mt: 0.5 }}
        variant="caption"
      >
        {note}
      </Typography>
    )}
  </Box>
)

const TagsAutocomplete = forwardRef<HTMLInputElement, TagsAutocompleteProps>(
  (
    {
      className,
      hideImplied,
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
    const displayed = hideImplied
      ? vocabulary.sort(explicit)
      : vocabulary.withImplied(explicit)
    const isInherited = (id: string) => id in inheritedTags
    const isStored = (id: string) => value.includes(id)
    const impliedBy = (id: string) =>
      displayed.filter(
        (other) =>
          (isStored(other) || isInherited(other)) &&
          vocabulary.ancestors(other).some((tag) => tag.id === id)
      )
    const isImpliedOnly = (id: string) =>
      !isStored(id) && !isInherited(id) && impliedBy(id).length > 0
    const isLocked = (id: string) => isInherited(id) || isImpliedOnly(id)

    const note = (id: string) => {
      if (isInherited(id))
        return `Inherited from ${inheritedTags[id].join(', ')}`
      if (isImpliedOnly(id))
        return `Implied by ${impliedBy(id).map(vocabulary.label).join(', ')}`
      return undefined
    }

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
              ...ids.filter((id) => isStored(id) || !isLocked(id)),
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
            <Checkbox checked={selected} size="small" />
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
            return (
              <Tooltip
                key={key}
                title={
                  <TagPath id={id} note={note(id)} vocabulary={vocabulary} />
                }
              >
                <Chip
                  {...itemProps}
                  label={vocabulary.label(id)}
                  onDelete={isLocked(id) ? undefined : onDelete}
                  size="small"
                  variant={isImpliedOnly(id) ? 'outlined' : 'filled'}
                />
              </Tooltip>
            )
          })
        }
        value={displayed}
      />
    )
  }
)

export default TagsAutocomplete
