import { useCallback, useRef } from 'react'

import type { IDoesFilterPassParams } from 'ag-grid-community'
import { type CustomFilterProps, useGridFilter } from 'ag-grid-react'
import { TagsAutocomplete } from 'components/inputs'
import { useTagsVocabulary } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { TaggedItem, TagId, TagTarget } from 'types/tags'

const useTagsFilterStyles = makeStyles({ name: 'TagsFilter' })((theme) => ({
  autocomplete: {
    padding: theme.spacing(1),
    width: 360,
  },
}))

export type TagsFilterProps = { itemType: TagTarget }

const TagsFilter = ({
  itemType,
  model,
  onModelChange,
}: CustomFilterProps<TaggedItem, unknown, TagId[]> & TagsFilterProps) => {
  const { classes } = useTagsFilterStyles()
  const tagsVocabulary = useTagsVocabulary()
  const inputRef = useRef<HTMLInputElement>(null)

  const doesFilterPass = useCallback(
    ({ data }: IDoesFilterPassParams<TaggedItem>) =>
      !model || model.some((id) => data.effectiveTags.includes(id)),
    [model]
  )
  const getModelAsString = useCallback(
    (current: TagId[] | null) =>
      tagsVocabulary
        .tops(current ?? [])
        .map(tagsVocabulary.pathLabel)
        .join(', '),
    [tagsVocabulary]
  )
  const afterGuiAttached = useCallback(() => inputRef.current?.focus(), [])
  useGridFilter({ afterGuiAttached, doesFilterPass, getModelAsString })

  return (
    <TagsAutocomplete
      className={classes.autocomplete}
      popperClassName="ag-custom-component-popup"
      itemType={itemType}
      mode="filter"
      onChange={(ids) => onModelChange(ids.length ? ids : null)}
      textFieldProps={{ inputRef, label: 'Filter tags', size: 'small' }}
      value={model ?? []}
    />
  )
}

export default TagsFilter
