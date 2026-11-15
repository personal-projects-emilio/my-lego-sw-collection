import {
  Children,
  cloneElement,
  type CSSProperties,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useMemo,
} from 'react'

import {
  Autocomplete as MuiAutocomplete,
  Box,
  Checkbox,
  Chip,
  ListSubheader,
  TextField,
  type TextFieldProps,
  type Theme,
  Tooltip,
  Typography,
  useTheme,
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

const GROUP_HEIGHT = 48
const GROUP_LAYER = 20
const OPTION_HEIGHT = 36

type OptionElement = ReactElement<{
  'aria-disabled'?: boolean
  'data-depth': number
  style?: CSSProperties
}>

const nestOptions = (
  options: OptionElement[],
  palette: Theme['palette']
): ReactNode[] => {
  const nested: ReactNode[] = []
  for (let start = 0; start < options.length;) {
    const option = options[start]
    const depth = option.props['data-depth']
    let end = start + 1
    while (end < options.length && options[end].props['data-depth'] > depth)
      end++
    nested.push(
      end === start + 1 ? (
        option
      ) : (
        <li key={`subtree-${option.key}`}>
          <ul style={{ padding: 0 }}>
            {cloneElement(option, {
              style: {
                ...option.props.style,
                background: palette.background.paper,
                color: option.props['aria-disabled']
                  ? palette.text.disabled
                  : undefined,
                opacity: 1,
                position: 'sticky',
                top: GROUP_HEIGHT + (depth - 1) * OPTION_HEIGHT,
                zIndex: GROUP_LAYER - depth,
              },
            })}
            {nestOptions(options.slice(start + 1, end), palette)}
          </ul>
        </li>
      )
    )
    start = end
  }
  return nested
}

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
    const theme = useTheme()
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
        renderGroup={({ key, group, children }) => (
          <li key={key}>
            <ListSubheader
              sx={{ lineHeight: `${GROUP_HEIGHT}px`, zIndex: GROUP_LAYER }}
            >
              {group}
            </ListSubheader>
            <ul style={{ padding: 0 }}>
              {nestOptions(
                Children.toArray(children) as OptionElement[],
                theme.palette
              )}
            </ul>
          </li>
        )}
        renderOption={({ key, ...props }, id, { selected }) => (
          <li
            key={key}
            {...props}
            data-depth={vocabulary.depth(id)}
            style={{
              height: OPTION_HEIGHT,
              paddingLeft: vocabulary.depth(id) * 16,
            }}
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
        slotProps={{
          listbox: { style: { padding: 0 } },
          popper: { className: popperClassName },
        }}
        renderValue={(ids, getItemProps) => {
          const tagChip = (id: string, chipLabel: string) => {
            const { key, onDelete, ...itemProps } = getItemProps({
              index: ids.indexOf(id),
            })
            return (
              <Chip
                key={key}
                {...itemProps}
                label={chipLabel}
                onDelete={isInherited(id) ? undefined : onDelete}
                size="small"
              />
            )
          }
          const notes = (group: string[]) =>
            Object.fromEntries(
              group.flatMap((id) => {
                const groupNote = note(id)
                return groupNote ? [[id, groupNote]] : []
              })
            )
          return vocabulary.siblingGroups(ids).map(({ parent, ids: group }) =>
            parent ? (
              <Tooltip
                key={`group-${parent}`}
                title={
                  <TagTree
                    ids={group}
                    notes={notes(group)}
                    vocabulary={vocabulary}
                  />
                }
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'action.hover',
                    border: 1,
                    borderColor: 'text.disabled',
                    borderRadius: 4,
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    m: 0.25,
                    pl: 1,
                    pr: 0.25,
                    py: 0.25,
                  }}
                >
                  <Typography variant="caption">
                    {vocabulary.pathLabel(parent)} ›
                  </Typography>
                  {group.map((id) => tagChip(id, vocabulary.label(id)))}
                </Box>
              </Tooltip>
            ) : note(group[0]) ? (
              <Tooltip key={`note-${group[0]}`} title={note(group[0])}>
                {tagChip(group[0], vocabulary.pathLabel(group[0]))}
              </Tooltip>
            ) : (
              tagChip(group[0], vocabulary.pathLabel(group[0]))
            )
          )
        }}
        value={chips}
      />
    )
  }
)

export default TagsAutocomplete
