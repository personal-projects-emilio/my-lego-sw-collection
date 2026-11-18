import type { CustomTooltipProps } from 'ag-grid-react'
import { useTagsVocabulary } from 'hooks'
import type { TaggedItem } from 'types/tags'

import TreeTooltip from './TreeTooltip'

const TagsTooltip = ({ data }: CustomTooltipProps<TaggedItem>) => (
  <TreeTooltip
    ids={data?.effectiveTags ?? []}
    inherited={data?.inheritedTags}
    tree={useTagsVocabulary()}
  />
)

export default TagsTooltip
