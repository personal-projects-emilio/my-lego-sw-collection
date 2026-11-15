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
  Checkbox,
  Chip,
  ListSubheader,
  TextField,
  type TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material'
import TagTree from 'components/TagTree'
import useVocabulary from 'hooks/useVocabulary'
import { makeStyles } from 'tss-react/mui'
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

const groupHeight = 48
const groupLayer = 20
const optionHeight = 36

const useTagsAutocompleteStyles = makeStyles({ name: 'TagsAutocomplete' })(
  (theme) => ({
    listbox: {
      padding: 0,
    },
    nestedList: {
      padding: 0,
    },
    groupHeader: {
      lineHeight: `${groupHeight}px`,
      zIndex: groupLayer,
    },
    pinned: {
      position: 'sticky',
      '&.Mui-focused': {
        backgroundImage: tint(theme.palette.action.hover),
      },
      '&[aria-selected="true"]': {
        backgroundImage: tint(
          theme.alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity
          )
        ),
      },
      '&[aria-selected="true"].Mui-focused': {
        backgroundImage: tint(
          theme.alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity +
              theme.palette.action.hoverOpacity
          )
        ),
      },
      '&[aria-disabled="true"]': {
        color: theme.palette.text.disabled,
      },
    },
    note: {
      color: theme.palette.text.secondary,
      fontStyle: 'italic',
      marginLeft: theme.spacing(1),
    },
    group: {
      alignItems: 'center',
      background: theme.palette.action.hover,
      border: `1px solid ${theme.palette.text.disabled}`,
      borderRadius: theme.spacing(2),
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: theme.spacing(0.5),
      margin: theme.spacing(0.25),
      padding: theme.spacing(0.25, 0.25, 0.25, 1),
    },
  })
)

type NestStyles = {
  background: string
  classes: Record<'nestedList' | 'pinned', string>
  cx: (...names: Array<string | undefined>) => string
}

const tint = (color: string) => `linear-gradient(${color}, ${color})`

type OptionElement = ReactElement<{
  className?: string
  'data-depth': number
  style?: CSSProperties
}>

const nestOptions = (
  options: OptionElement[],
  styles: NestStyles
): ReactNode[] => {
  const { background, classes, cx } = styles
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
          <ul className={classes.nestedList}>
            {cloneElement(option, {
              className: cx(option.props.className, classes.pinned),
              style: {
                ...option.props.style,
                backgroundColor: background,
                opacity: 1,
                top: groupHeight + (depth - 1) * optionHeight,
                zIndex: groupLayer - depth,
              },
            })}
            {nestOptions(options.slice(start + 1, end), styles)}
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
    const { classes, cx, theme } = useTagsAutocompleteStyles()
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
            <ListSubheader className={classes.groupHeader} component="div">
              {group}
            </ListSubheader>
            <ul className={classes.nestedList}>
              {nestOptions(Children.toArray(children) as OptionElement[], {
                background: theme.palette.background.paper,
                classes,
                cx,
              })}
            </ul>
          </li>
        )}
        renderOption={({ key, ...props }, id, { selected }) => (
          <li
            key={key}
            {...props}
            data-depth={vocabulary.depth(id)}
            style={{
              height: optionHeight,
              paddingLeft: vocabulary.depth(id) * 16,
            }}
          >
            <Checkbox checked={selected || isImplied(id)} size="small" />
            {vocabulary.label(id)}
            {note(id) && (
              <Typography className={classes.note} variant="caption">
                {note(id)}
              </Typography>
            )}
          </li>
        )}
        slotProps={{
          listbox: { className: classes.listbox },
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
                <div className={classes.group}>
                  <Typography variant="caption">
                    {vocabulary.pathLabel(parent)} ›
                  </Typography>
                  {group.map((id) => tagChip(id, vocabulary.label(id)))}
                </div>
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
