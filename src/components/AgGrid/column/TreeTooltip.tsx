import type { FC } from 'react'

import TreeView from 'components/TreeView'
import { makeStyles } from 'tss-react/mui'
import { inheritedFrom } from 'utils/tags'
import type { TreeModel } from 'utils/tree'

type TreeTooltipProps = {
  ids: string[]
  inherited?: Record<string, Array<string | number>>
  tree: TreeModel
}

const useTreeTooltipStyles = makeStyles({ name: 'TreeTooltip' })({
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

const TreeTooltip: FC<TreeTooltipProps> = ({ ids, inherited = {}, tree }) => {
  const { classes } = useTreeTooltipStyles()
  if (!ids.length) return null
  const notes = Object.fromEntries(
    Object.entries(inherited).map(([id, sources]) => [
      id,
      inheritedFrom(sources),
    ])
  )
  return (
    <div className={classes.tooltip}>
      <TreeView ids={ids} notes={notes} tree={tree} />
    </div>
  )
}

export default TreeTooltip
