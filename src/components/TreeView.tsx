import type { FC } from 'react'

import { makeStyles } from 'tss-react/mui'
import type { TreeModel } from 'utils/tree'

const useTreeViewStyles = makeStyles({ name: 'TreeView' })((theme) => ({
  tree: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    letterSpacing: theme.typography.caption.letterSpacing,
    lineHeight: theme.typography.caption.lineHeight,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  branch: {
    fontWeight: 400,
    listStyle: 'none',
    margin: theme.spacing(0, 0, 0, 0.75),
    padding: 0,
    textTransform: 'none',
  },
  root: {
    fontWeight: 700,
    textTransform: 'uppercase',
    '& + &': {
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: theme.spacing(0.75),
      paddingTop: theme.spacing(0.75),
    },
  },
  child: {
    paddingLeft: theme.spacing(1.5),
    position: 'relative',
    '&::before': {
      borderBottom: `1px solid ${theme.palette.text.disabled}`,
      borderLeft: `1px solid ${theme.palette.text.disabled}`,
      content: '""',
      height: '0.83em',
      left: 0,
      position: 'absolute',
      top: 0,
      width: theme.spacing(1),
    },
    '&:not(:last-child)::after': {
      borderLeft: `1px solid ${theme.palette.text.disabled}`,
      bottom: 0,
      content: '""',
      left: 0,
      position: 'absolute',
      top: 0,
    },
  },
  note: {
    fontStyle: 'italic',
    marginLeft: theme.spacing(1),
    opacity: 0.7,
  },
}))

type TreeViewProps = {
  ids: string[]
  notes?: Record<string, string>
  tree: TreeModel
}

const TreeView: FC<TreeViewProps> = ({ ids, notes = {}, tree }) => {
  const { classes } = useTreeViewStyles()
  const nodes = tree.outline(ids)
  const leaves = new Set(tree.leaves(ids))

  const branch = (parent: string | undefined) => {
    const children = nodes.filter((node) => node.parent === parent)
    if (!children.length) return null
    return (
      <ul className={parent ? classes.branch : classes.tree}>
        {children.map(({ id, label }) => (
          <li key={id} className={parent ? classes.child : classes.root}>
            {label}
            {leaves.has(id) && notes[id] && (
              <span className={classes.note}>{notes[id]}</span>
            )}
            {branch(id)}
          </li>
        ))}
      </ul>
    )
  }

  return branch(undefined)
}

export default TreeView
