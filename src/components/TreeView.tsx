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
  root: {
    '& + &': {
      marginTop: theme.spacing(0.75),
    },
  },
  divider: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: 700,
    gap: theme.spacing(1),
    textTransform: 'uppercase',
    '&::after': {
      borderTop: `1px solid ${theme.palette.text.disabled}`,
      content: '""',
      flex: 1,
    },
  },
  branch: {
    listStyle: 'none',
    margin: theme.spacing(0, 0, 0, 0.75),
    padding: 0,
  },
  child: {
    paddingLeft: theme.spacing(1.5),
    position: 'relative',
    '&::before': {
      borderBottom: `1px solid ${theme.palette.text.disabled}`,
      content: '""',
      height: '0.83em',
      left: 1,
      position: 'absolute',
      top: 0,
      width: `calc(${theme.spacing(1)} - 1px)`,
    },
    '&:last-child::before': {
      borderLeft: `1px solid ${theme.palette.text.disabled}`,
      left: 0,
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
  rootNote: {
    fontStyle: 'italic',
    opacity: 0.7,
    fontWeight: 400,
    marginLeft: 0,
    textTransform: 'none',
  },
}))

type TreeViewProps = {
  ids: string[]
  notes?: Record<string, string>
  tree: TreeModel
}

const TreeView: FC<TreeViewProps> = ({ ids, notes = {}, tree }) => {
  const { classes } = useTreeViewStyles()
  const nodes = tree.getOutline(ids)
  const leaves = new Set(tree.getLeaves(ids))
  const getChildren = (parent: string) =>
    nodes.filter((node) => node.parent === parent)

  const renderBranch = (parent: string) => {
    const children = getChildren(parent)
    if (!children.length) return null
    return (
      <ul className={classes.branch}>
        {children.map(({ id, label }) => (
          <li key={id} className={classes.child}>
            {label}
            {leaves.has(id) && notes[id] && (
              <span className={classes.note}>{notes[id]}</span>
            )}
            {renderBranch(id)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={classes.tree}>
      {nodes
        .filter((node) => !node.parent)
        .map(({ id, label }) => (
          <li key={id} className={classes.root}>
            <div className={classes.divider}>
              {label}
              {leaves.has(id) && notes[id] && (
                <span className={classes.rootNote}>{notes[id]}</span>
              )}
            </div>
            {renderBranch(id)}
          </li>
        ))}
    </ul>
  )
}

export default TreeView
