import { Paper } from '@mui/material'
import type { CustomTooltipProps } from 'ag-grid-react'
import TagTree from 'components/TagTree'
import useVocabulary from 'hooks/useVocabulary'
import { makeStyles } from 'tss-react/mui'

const useTagsTooltipStyles = makeStyles({ name: 'TagsTooltip' })((theme) => ({
  paper: {
    maxWidth: 420,
    padding: theme.spacing(1, 1.5),
  },
}))

type TaggedItem = {
  effectiveTags: string[]
  inheritedTags?: Record<string, Array<string | number>>
}

const TagsTooltip = ({ data }: CustomTooltipProps<TaggedItem>) => {
  const { classes } = useTagsTooltipStyles()
  const vocabulary = useVocabulary()
  if (!data?.effectiveTags.length) return null

  const notes = Object.fromEntries(
    Object.entries(data.inheritedTags ?? {}).map(([id, sources]) => [
      id,
      `from ${sources.join(', ')}`,
    ])
  )

  return (
    <Paper className={classes.paper} elevation={8}>
      <TagTree ids={data.effectiveTags} notes={notes} vocabulary={vocabulary} />
    </Paper>
  )
}

export default TagsTooltip
