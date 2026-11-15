import { useCallback } from 'react'

import { Box } from '@mui/material'
import type { IDoesFilterPassParams } from 'ag-grid-community'
import { type CustomFilterProps, useGridFilter } from 'ag-grid-react'
import { TagsAutocomplete } from 'components/inputs'
import useVocabulary from 'hooks/useVocabulary'
import type { TagTarget } from 'types/tags'

export type TagsFilterProps = { itemType: TagTarget }

const TagsFilter = ({
  itemType,
  model,
  onModelChange,
}: CustomFilterProps<{ effectiveTags: string[] }, unknown, string[]> &
  TagsFilterProps) => {
  const vocabulary = useVocabulary()

  const doesFilterPass = useCallback(
    ({ data }: IDoesFilterPassParams<{ effectiveTags: string[] }>) =>
      !model || model.some((id) => data.effectiveTags.includes(id)),
    [model]
  )
  const getModelAsString = useCallback(
    (current: string[] | null) =>
      (current ?? []).map(vocabulary.label).join(', '),
    [vocabulary]
  )
  useGridFilter({ doesFilterPass, getModelAsString })

  return (
    <Box sx={{ p: 1, width: 360 }}>
      <TagsAutocomplete
        popperClassName="ag-custom-component-popup"
        itemType={itemType}
        onChange={(ids) => onModelChange(ids.length ? ids : null)}
        textFieldProps={{ placeholder: 'Filter tags', size: 'small' }}
        value={model ?? []}
      />
    </Box>
  )
}

export default TagsFilter
