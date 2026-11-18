import type { FC } from 'react'

import { KindIcon } from 'components/Timeline'
import type { TimelineEntry, TimelineId } from 'types/timeline'
import { formatRange } from 'utils/timeline'

import { countLabel, type Counts } from './counts'
import type { Side } from './eraLayout'
import useTimelineEraSectionsStyles from './TimelineEraSections.styles'

type TimelineCardProps = {
  entry: TimelineEntry
  side: Side
  counts: Counts
  onSelect: (id: TimelineId) => void
}

const TimelineCard: FC<TimelineCardProps> = ({
  entry,
  side,
  counts,
  onSelect,
}) => {
  const { classes, cx } = useTimelineEraSectionsStyles()
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.id)}
      className={cx(
        classes.focusable,
        classes.card,
        classes.clickable,
        side === 'left' ? classes.leftCard : classes.rightCard
      )}
    >
      <KindIcon kind={entry.kind} />
      <span className={classes.cardText}>
        <span className={classes.cardTitle}>{entry.label}</span>
        <span className={classes.meta}>
          {entry.end !== undefined && entry.end !== entry.start
            ? `${formatRange(entry)} · `
            : ''}
          {countLabel({ counts, id: entry.id })}
        </span>
      </span>
    </button>
  )
}

export default TimelineCard
