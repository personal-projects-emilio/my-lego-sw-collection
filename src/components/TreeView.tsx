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
    listStyle: 'none',
    margin: 0,
    paddingLeft: theme.spacing(1.5),
  },
  root: {
    fontWeight: 700,
    marginTop: theme.spacing(0.5),
    textTransform: 'uppercase',
  },
  child: {
    fontWeight: 400,
    textTransform: 'none',
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
  const { classes, cx } = useTreeViewStyles()
  const nodes = tree.outline(ids)
  const leaves = new Set(tree.leaves(ids))

  const branch = (parent: string | undefined) => {
    const children = nodes.filter((node) => node.parent === parent)
    if (!children.length) return null
    return (
      <ul className={parent ? cx(classes.branch, classes.child) : classes.tree}>
        {children.map(({ id, label }) => (
          <li key={id} className={cx({ [classes.root]: !parent })}>
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
