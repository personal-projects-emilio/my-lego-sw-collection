import type { FC } from 'react'

import type { TimelineEntry, TimelineId } from 'types/timeline'
import { formatRange, type Timeline } from 'utils/timeline'

import type { Side } from './eraLayout'
import useTimelineEraSectionsStyles from './TimelineEraSections.styles'

type TrilogyBracketProps = {
  timeline: Timeline
  trilogy: TimelineEntry
  side: Side
  from: number
  to: number
  duplicate: boolean
  onSelect: (id: TimelineId) => void
}

const TrilogyBracket: FC<TrilogyBracketProps> = ({
  timeline,
  trilogy,
  side,
  from,
  to,
  duplicate,
  onSelect,
}) => {
  const { classes, cx } = useTimelineEraSectionsStyles()
  return (
    <button
      type="button"
      onClick={() => onSelect(trilogy.id)}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      className={cx(
        classes.focusable,
        classes.bracket,
        classes.clickable,
        side === 'left' ? classes.leftBracket : classes.rightBracket
      )}
      style={{
        gridColumn: side === 'left' ? 1 : 5,
        gridRow: `${from} / ${to + 1}`,
      }}
      title={formatRange(timeline.range(trilogy.id))}
    >
      <span className={classes.bracketLabel}>{trilogy.label}</span>
    </button>
  )
}

export default TrilogyBracket
