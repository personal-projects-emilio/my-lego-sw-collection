import type { FC } from 'react'

import { Tooltip, Typography } from '@mui/material'
import TreeView from 'components/TreeView'
import { makeStyles } from 'tss-react/mui'
import { inheritedFrom } from 'utils/tags'
import type { TreeModel } from 'utils/tree'

type TreeCellProps = {
  ids: string[]
  inherited?: Record<string, Array<string | number>>
  text?: string | null
  tree: TreeModel
}

const useTreeCellStyles = makeStyles({ name: 'TreeCell' })({
  text: {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
  },
})

const TreeCell: FC<TreeCellProps> = ({ ids, inherited = {}, text, tree }) => {
  const { classes } = useTreeCellStyles()
  const typography = (
    <Typography className={classes.text} noWrap variant="body2">
      {text}
    </Typography>
  )
  if (!ids.length) return typography
  const notes = Object.fromEntries(
    Object.entries(inherited).map(([id, sources]) => [
      id,
      inheritedFrom(sources),
    ])
  )
  return (
    <Tooltip arrow title={<TreeView ids={ids} notes={notes} tree={tree} />}>
      {typography}
    </Tooltip>
  )
}

export default TreeCell
