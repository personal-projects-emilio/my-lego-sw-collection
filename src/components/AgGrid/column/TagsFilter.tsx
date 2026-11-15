import { useCallback } from 'react'

import type { IDoesFilterPassParams } from 'ag-grid-community'
import { type CustomFilterProps, useGridFilter } from 'ag-grid-react'
import { TagsAutocomplete } from 'components/inputs'
import useTagsVocabulary from 'hooks/useTagsVocabulary'
import { makeStyles } from 'tss-react/mui'
import type { TagTarget } from 'types/tags'

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
}: CustomFilterProps<{ effectiveTags: string[] }, unknown, string[]> &
  TagsFilterProps) => {
  const { classes } = useTagsFilterStyles()
  const vocabulary = useTagsVocabulary()

  const doesFilterPass = useCallback(
    ({ data }: IDoesFilterPassParams<{ effectiveTags: string[] }>) =>
      !model || model.some((id) => data.effectiveTags.includes(id)),
    [model]
  )
  const getModelAsString = useCallback(
    (current: string[] | null) =>
      vocabulary
        .leaves(current ?? [])
        .map(vocabulary.pathLabel)
        .join(', '),
    [vocabulary]
  )
  useGridFilter({ doesFilterPass, getModelAsString })

  return (
    <TagsAutocomplete
      className={classes.autocomplete}
      popperClassName="ag-custom-component-popup"
      itemType={itemType}
      onChange={(ids) => onModelChange(ids.length ? ids : null)}
      textFieldProps={{ placeholder: 'Filter tags', size: 'small' }}
      value={model ?? []}
    />
  )
}

export default TagsFilter
