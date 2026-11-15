import { Paper } from '@mui/material'
import type { CustomTooltipProps } from 'ag-grid-react'
import TagTree from 'components/TagTree'
import useVocabulary from 'hooks/useVocabulary'

type TaggedItem = {
  effectiveTags: string[]
  inheritedTags?: Record<string, Array<string | number>>
}

const TagsTooltip = ({ data }: CustomTooltipProps<TaggedItem>) => {
  const vocabulary = useVocabulary()
  if (!data?.effectiveTags.length) return null

  const notes = Object.fromEntries(
    Object.entries(data.inheritedTags ?? {}).map(([id, sources]) => [
      id,
      `from ${sources.join(', ')}`,
    ])
  )

  return (
    <Paper elevation={8} sx={{ maxWidth: 420, px: 1.5, py: 1 }}>
      <TagTree ids={data.effectiveTags} notes={notes} vocabulary={vocabulary} />
    </Paper>
  )
}

export default TagsTooltip
