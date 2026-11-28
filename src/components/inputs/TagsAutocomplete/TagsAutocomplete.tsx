import { Children, forwardRef, useEffect, useId, useMemo } from 'react'

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
import { filterTagsAfterPick, getStoredTagsAfterPick } from 'utils/tags'

import renderLimitedChips from '../renderLimitedChips'
import nestOptions, { isOptionElement } from './nestOptions'
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
      () => tagsVocabulary.getPickable(itemType),
      [tagsVocabulary, itemType]
    )
    const isFilter = mode === 'filter'
    const chips = isFilter
      ? tagsVocabulary.getTops(value)
      : tagsVocabulary.sort([
          ...tagsVocabulary.getLeaves(value),
          ...tagsVocabulary.getLeaves(Object.keys(inheritedTags)),
        ])

    const { isInherited, isCovered, getNote } = useTagNotes({
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
        getOptionLabel={tagsVocabulary.getPathLabel}
        groupBy={(id) => tagsVocabulary.getRoot(id)?.label ?? ''}
        multiple
        onBlur={onBlur}
        onChange={(_event, ids) =>
          onChange(
            isFilter
              ? filterTagsAfterPick({ tagsVocabulary, picked: ids })
              : getStoredTagsAfterPick({
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
                options: Children.toArray(children).filter(isOptionElement),
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
          const optionNote = getNote(id)
          return (
            <li
              key={key}
              {...props}
              aria-label={[tagsVocabulary.getPathLabel(id), optionNote]
                .filter(Boolean)
                .join(', ')}
              className={optionClassName}
              data-depth={tagsVocabulary.getDepth(id)}
              style={{ '--depth': tagsVocabulary.getDepth(id) }}
            >
              <Checkbox
                aria-hidden
                checked={selected || isCovered(id)}
                size="small"
                tabIndex={-1}
              />
              {tagsVocabulary.getLabel(id)}
              {optionNote && !isFilter && (
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
          const renderTagChip = ({
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
          const getNotes = (group: TagId[]) =>
            Object.fromEntries(
              group.flatMap((id) => {
                const groupNote = getNote(id)
                return groupNote ? [[id, groupNote]] : []
              })
            )
          const groupChips = tagsVocabulary
            .getSiblingGroups(ids)
            .map(({ parent, ids: group }) => {
              if (parent)
                return (
                  <Tooltip
                    key={`group-${parent}`}
                    describeChild
                    title={
                      <TreeView
                        ids={group}
                        notes={getNotes(group)}
                        tree={tagsVocabulary}
                      />
                    }
                  >
                    <div
                      aria-label={tagsVocabulary.getPathLabel(parent)}
                      className={classes.group}
                      role="group"
                    >
                      <Typography aria-hidden variant="caption">
                        {tagsVocabulary.getPathLabel(parent)} ›
                      </Typography>
                      {group.map((id) =>
                        renderTagChip({
                          id,
                          chipLabel: tagsVocabulary.getLabel(id),
                        })
                      )}
                    </div>
                  </Tooltip>
                )
              const [id] = group
              const chip = renderTagChip({
                id,
                chipLabel: tagsVocabulary.getPathLabel(id),
              })
              const chipNote = getNote(id)
              if (!chipNote) return chip
              return (
                <Tooltip key={`note-${id}`} describeChild title={chipNote}>
                  {chip}
                </Tooltip>
              )
            })
          return renderLimitedChips({
            chips: groupChips,
            title: <TreeView ids={ids} tree={tagsVocabulary} />,
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
