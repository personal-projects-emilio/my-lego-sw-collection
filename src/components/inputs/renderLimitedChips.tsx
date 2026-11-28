import type { ReactNode } from 'react'

import { Chip, Tooltip } from '@mui/material'

const renderLimitedChips = ({
  chips,
  limit,
  title,
}: {
  chips: ReactNode[]
  limit?: number
  title: ReactNode
}) => {
  if (limit === undefined || chips.length <= limit) return chips
  const hiddenCount = chips.length - limit
  return [
    ...chips.slice(0, limit),
    <Tooltip key="more" describeChild title={title}>
      <Chip
        aria-label={`${hiddenCount} more`}
        label={`+${hiddenCount}`}
        size="small"
        tabIndex={0}
      />
    </Tooltip>,
  ]
}

export default renderLimitedChips
