import type { FC } from 'react'

import { Box, Typography } from '@mui/material'
import type { Vocabulary } from 'utils/tags'

type TagTreeProps = {
  ids: string[]
  notes?: Record<string, string>
  vocabulary: Vocabulary
}

const TagTree: FC<TagTreeProps> = ({ ids, notes = {}, vocabulary }) => {
  const leaves = new Set(vocabulary.leaves(ids))
  return (
    <Box>
      {vocabulary.tree(ids).map(({ id, label, depth }) => (
        <Typography
          key={id}
          sx={{
            display: 'block',
            fontWeight: depth === 0 ? 700 : 400,
            mt: depth === 0 ? 0.5 : 0,
            pl: depth * 1.5,
            textTransform: depth === 0 ? 'uppercase' : 'none',
          }}
          variant="caption"
        >
          {label}
          {leaves.has(id) && notes[id] && (
            <Typography
              component="span"
              sx={{ fontStyle: 'italic', ml: 1, opacity: 0.7 }}
              variant="caption"
            >
              {notes[id]}
            </Typography>
          )}
        </Typography>
      ))}
    </Box>
  )
}

export default TagTree
