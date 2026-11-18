import {
  Children,
  type CSSProperties,
  forwardRef,
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
import type { InheritedTags, TagId, TagTarget } from 'types/tags'
import { filterTagsAfterPick, storedTagsAfterPick } from 'utils/tags'

import nestOptions, { type OptionElement } from './nestOptions'
import useTagsAutocompleteStyles from './TagsAutocomplete.styles'
import useTagNotes from './useTagNotes'

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
    const { classes } = useTagsAutocompleteStyles()
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

    const { isInherited, isCovered, note } = useTagNotes({
      tagsVocabulary,
      options,
      chips,
      isFilter,
      inheritedTags,
    })

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
              ? filterTagsAfterPick({ tagsVocabulary, picked: ids })
              : storedTagsAfterPick({
                  tagsVocabulary,
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
              {nestOptions({
                options: Children.toArray(children) as OptionElement[],
                subtreeClassName: classes.subtree,
              })}
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
              className={optionClassName}
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
        classes={{ option: classes.option }}
        slotProps={{
          listbox: { className: classes.listbox },
          popper: { className: popperClassName },
        }}
        renderValue={(ids, getItemProps) => {
          const tagChip = ({
            id,
            chipLabel,
          }: {
            id: TagId
            chipLabel: string
          }) => {
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
                      {group.map((id) =>
                        tagChip({ id, chipLabel: tagsVocabulary.label(id) })
                      )}
                    </div>
                  </Tooltip>
                )
              const [id] = group
              const chip = tagChip({
                id,
                chipLabel: tagsVocabulary.pathLabel(id),
              })
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
      <div className={`${classes.field} ${className ?? ''}`}>
        {autocomplete}
        <TagsDrawerButton className={classes.editButton} />
      </div>
    )
  }
)

export default TagsAutocomplete
