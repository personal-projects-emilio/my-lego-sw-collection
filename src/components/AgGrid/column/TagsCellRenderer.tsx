import type { CustomCellRendererProps } from 'ag-grid-react'
import { useTagsVocabulary } from 'hooks'
import type { TaggedItem, TagId } from 'types/tags'

import TreeCell from './TreeCell'

const TagsCellRenderer = ({
  data,
  valueFormatted,
}: CustomCellRendererProps<TaggedItem, TagId[]>) => (
  <TreeCell
    ids={data?.effectiveTags ?? []}
    inherited={data?.inheritedTags}
    text={valueFormatted}
    tree={useTagsVocabulary()}
  />
)

export default TagsCellRenderer
