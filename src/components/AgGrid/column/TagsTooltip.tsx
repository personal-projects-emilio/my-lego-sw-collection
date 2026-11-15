import type { CustomTooltipProps } from 'ag-grid-react'
import TreeView from 'components/TreeView'
import useTagsVocabulary from 'hooks/useTagsVocabulary'
import { makeStyles } from 'tss-react/mui'

const useTagsTooltipStyles = makeStyles({ name: 'TagsTooltip' })({
  tooltip: {
    backgroundColor: 'var(--ag-tooltip-background-color)',
    border: 'var(--ag-tooltip-border)',
    borderRadius: 'var(--ag-border-radius)',
    color: 'var(--ag-tooltip-text-color)',
    maxWidth: 420,
    padding:
      'var(--ag-widget-container-vertical-padding) var(--ag-widget-container-horizontal-padding)',
  },
})

type TaggedItem = {
  effectiveTags: string[]
  inheritedTags?: Record<string, Array<string | number>>
}

const TagsTooltip = ({ data }: CustomTooltipProps<TaggedItem>) => {
  const { classes } = useTagsTooltipStyles()
  const tagsVocabulary = useTagsVocabulary()
  if (!data?.effectiveTags.length) return null

  const notes = Object.fromEntries(
    Object.entries(data.inheritedTags ?? {}).map(([id, sources]) => [
      id,
      `from ${sources.join(', ')}`,
    ])
  )

  return (
    <TreeView
      className={classes.tooltip}
      ids={data.effectiveTags}
      notes={notes}
      tree={tagsVocabulary}
    />
  )
}

export default TagsTooltip
