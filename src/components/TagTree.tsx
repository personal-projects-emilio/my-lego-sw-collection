import type { FC } from 'react'

import { Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import type { Vocabulary } from 'utils/tags'

const useTagTreeStyles = makeStyles({ name: 'TagTree' })((theme) => ({
  line: {
    display: 'block',
  },
  root: {
    fontWeight: 700,
    marginTop: theme.spacing(0.5),
    textTransform: 'uppercase',
  },
  note: {
    fontStyle: 'italic',
    marginLeft: theme.spacing(1),
    opacity: 0.7,
  },
}))

type TagTreeProps = {
  ids: string[]
  notes?: Record<string, string>
  vocabulary: Vocabulary
}

const TagTree: FC<TagTreeProps> = ({ ids, notes = {}, vocabulary }) => {
  const { classes, cx } = useTagTreeStyles()
  const leaves = new Set(vocabulary.leaves(ids))
  return (
    <div>
      {vocabulary.tree(ids).map(({ id, label, depth }) => (
        <Typography
          key={id}
          className={cx(classes.line, { [classes.root]: depth === 0 })}
          style={{ paddingLeft: depth * 12 }}
          variant="caption"
        >
          {label}
          {leaves.has(id) && notes[id] && (
            <Typography
              className={classes.note}
              component="span"
              variant="caption"
            >
              {notes[id]}
            </Typography>
          )}
        </Typography>
      ))}
    </div>
  )
}

export default TagTree
