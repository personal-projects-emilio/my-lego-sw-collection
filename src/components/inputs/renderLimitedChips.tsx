import type { ReactNode } from 'react'

import { Chip, Tooltip } from '@mui/material'

const limit = 3

const renderLimitedChips = ({
  chips,
  title,
}: {
  chips: ReactNode[]
  title: ReactNode
}) => {
  if (chips.length <= limit) return chips
  const hiddenCount = chips.length - limit
  return [
    ...chips.slice(0, limit),
    <Tooltip key="more" describeChild title={title}>
      <Chip
        aria-label={`${hiddenCount} more`}
        role="img"
        label={`+${hiddenCount}`}
        size="small"
        tabIndex={0}
      />
    </Tooltip>,
  ]
}

export default renderLimitedChips
