import {
  Children,
  cloneElement,
  type CSSProperties,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
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
import { useTagsQuery } from 'api/tags'
import { TagsDrawerButton } from 'components/TagsDrawer'
import TreeView from 'components/TreeView'
import { useTagsVocabulary } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { InheritedTags, TagId, TagTarget } from 'types/tags'
import {
  filterTagsAfterPick,
  inheritedFrom,
  storedTagsAfterPick,
} from 'utils/tags'

type TagsAutocompleteProps = {
  className?: string
  disabled?: boolean
  inheritedTags?: InheritedTags
  itemType: TagTarget
  mode?: 'store' | 'filter'
  name?: string
  onBlur?: () => void
  onChange: (tags: TagId[]) => void
  popperClassName?: string
  textFieldProps?: Partial<TextFieldProps>
  value: TagId[]
}

const noInheritedTags: InheritedTags = {}

const groupHeight = 48
const groupLayer = 20
const optionHeight = 36

const tint = (color: string) => `linear-gradient(${color}, ${color})`

const useTagsAutocompleteStyles = makeStyles({ name: 'TagsAutocomplete' })(
  (theme) => ({
    field: {
      alignItems: 'flex-start',
      display: 'flex',
      gap: theme.spacing(0.5),
    },
    grow: {
      flex: 1,
      minWidth: 0,
    },
    editButton: {
      marginTop: theme.spacing(2),
    },
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
    option: {
      '&&&': {
        height: optionHeight,
        paddingLeft: `calc(var(--depth) * ${theme.spacing(2)})`,
      },
    },
    pinned: {
      '&&&&&': {
        backgroundColor: theme.palette.background.paper,
        opacity: 1,
        position: 'sticky',
        top: `calc(${groupHeight}px + (var(--depth) - 1) * ${optionHeight}px)`,
        zIndex: `calc(${groupLayer} - var(--depth))`,
      },
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
      '&&&&&[aria-disabled="true"]': {
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

type NestClasses = Record<'nestedList' | 'pinned', string>

type OptionElement = ReactElement<{
  className?: string
  'data-depth': number
}>

const nestOptions = (
  options: OptionElement[],
  classes: NestClasses,
  cx: (...names: Array<string | undefined>) => string
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
        <li key={`subtree-${option.key}`} role="presentation">
          <ul className={classes.nestedList} role="presentation">
            {cloneElement(option, {
              className: cx(option.props.className, classes.pinned),
            })}
            {nestOptions(options.slice(start + 1, end), classes, cx)}
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
      disabled,
      inheritedTags = noInheritedTags,
      itemType,
      mode = 'store',
      name,
      onBlur,
      onChange,
      popperClassName,
      textFieldProps,
      value,
    },
    ref
  ) => {
    const tagsVocabulary = useTagsVocabulary()
    const { data: tagsList } = useTagsQuery()
    useEffect(() => {
      if (!tagsList) return
      const known = new Set(tagsList.map(({ id }) => id))
      if (value.some((id) => !known.has(id)))
        onChange(value.filter((id) => known.has(id)))
    }, [tagsList, value, onChange])
    const { classes, cx } = useTagsAutocompleteStyles()
    const groupId = useId()
    const options = useMemo(
      () => tagsVocabulary.pickable(itemType),
      [tagsVocabulary, itemType]
    )
    const isFilter = mode === 'filter'
    const chips = isFilter
      ? tagsVocabulary.tops(value)
      : tagsVocabulary.sort([
          ...tagsVocabulary.leaves(value),
          ...tagsVocabulary.leaves(Object.keys(inheritedTags)),
        ])

    const coveringChips = new Map<TagId, TagId[]>()
    const chipSet = new Set(chips)
    if (isFilter) {
      options.forEach((id) => {
        const covering = tagsVocabulary
          .ancestors(id)
          .map((tag) => tag.id)
          .filter((ancestor) => chipSet.has(ancestor))
        if (covering.length) coveringChips.set(id, covering)
      })
    } else {
      chips.forEach((chip) =>
        tagsVocabulary.ancestors(chip).forEach(({ id }) => {
          if (!chipSet.has(id))
            coveringChips.set(id, [...(coveringChips.get(id) ?? []), chip])
        })
      )
    }

    const isInherited = (id: TagId) => id in inheritedTags
    const isCovered = (id: TagId) => coveringChips.has(id)

    const note = (id: TagId) => {
      if (isInherited(id)) return inheritedFrom(inheritedTags[id])
      const covering = coveringChips.get(id)
      if (!covering) return undefined
      const labels = covering.map(tagsVocabulary.label).join(', ')
      return isFilter ? `Included in ${labels}` : `Implied by ${labels}`
    }

    const autocomplete = (
      <MuiAutocomplete
        className={isFilter ? className : classes.grow}
        disableCloseOnSelect
        disabled={disabled}
        getOptionDisabled={(id) => isInherited(id) || isCovered(id)}
        getOptionLabel={tagsVocabulary.pathLabel}
        groupBy={(id) => tagsVocabulary.rootOf(id)?.label ?? ''}
        multiple
        onBlur={onBlur}
        onChange={(_event, ids) =>
          onChange(
            isFilter
              ? filterTagsAfterPick(tagsVocabulary, ids)
              : storedTagsAfterPick(tagsVocabulary, {
                  picked: ids,
                  stored: value,
                  inheritedTags,
                })
          )
        }
        openOnFocus
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            ref={ref}
            name={name}
            variant="outlined"
            {...textFieldProps}
          />
        )}
        renderGroup={({ key, group, children }) => (
          <li key={key} aria-labelledby={`${groupId}-${key}`} role="group">
            <ListSubheader
              className={classes.groupHeader}
              component="div"
              id={`${groupId}-${key}`}
            >
              {group}
            </ListSubheader>
            <ul className={classes.nestedList} role="presentation">
              {nestOptions(
                Children.toArray(children) as OptionElement[],
                classes,
                cx
              )}
            </ul>
          </li>
        )}
        renderOption={(
          { key, className: optionClassName, ...props },
          id,
          { selected }
        ) => {
          const optionNote = note(id)
          return (
            <li
              key={key}
              {...props}
              aria-label={[tagsVocabulary.pathLabel(id), optionNote]
                .filter(Boolean)
                .join(', ')}
              className={cx(optionClassName, classes.option)}
              data-depth={tagsVocabulary.depth(id)}
              style={{ '--depth': tagsVocabulary.depth(id) } as CSSProperties}
            >
              <Checkbox
                aria-hidden
                checked={selected || isCovered(id)}
                size="small"
                tabIndex={-1}
              />
              {tagsVocabulary.label(id)}
              {optionNote && (
                <Typography className={classes.note} variant="caption">
                  {optionNote}
                </Typography>
              )}
            </li>
          )
        }}
        slotProps={{
          listbox: { className: classes.listbox },
          popper: { className: popperClassName },
        }}
        renderValue={(ids, getItemProps) => {
          const tagChip = (id: TagId, chipLabel: string) => {
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
          const notes = (group: TagId[]) =>
            Object.fromEntries(
              group.flatMap((id) => {
                const groupNote = note(id)
                return groupNote ? [[id, groupNote]] : []
              })
            )
          return tagsVocabulary
            .siblingGroups(ids)
            .map(({ parent, ids: group }) => {
              if (parent)
                return (
                  <Tooltip
                    key={`group-${parent}`}
                    describeChild
                    title={
                      <TreeView
                        ids={group}
                        notes={notes(group)}
                        tree={tagsVocabulary}
                      />
                    }
                  >
                    <div
                      aria-label={tagsVocabulary.pathLabel(parent)}
                      className={classes.group}
                      role="group"
                    >
                      <Typography aria-hidden variant="caption">
                        {tagsVocabulary.pathLabel(parent)} ›
                      </Typography>
                      {group.map((id) => tagChip(id, tagsVocabulary.label(id)))}
                    </div>
                  </Tooltip>
                )
              const [id] = group
              const chip = tagChip(id, tagsVocabulary.pathLabel(id))
              const chipNote = note(id)
              if (!chipNote) return chip
              return (
                <Tooltip key={`note-${id}`} describeChild title={chipNote}>
                  {chip}
                </Tooltip>
              )
            })
        }}
        value={chips}
      />
    )

    if (isFilter) return autocomplete
    return (
      <div className={cx(classes.field, className)}>
        {autocomplete}
        <TagsDrawerButton className={classes.editButton} />
      </div>
    )
  }
)

export default TagsAutocomplete
