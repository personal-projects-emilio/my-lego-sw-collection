import { type FC, Fragment } from 'react'

import { getEraColor } from 'components/Timeline'
import type { TimelineEntry, TimelineId } from 'types/timeline'
import { formatRange, formatYear, type Timeline } from 'utils/timeline'

import type { Counts } from './counts'
import { buildEraLayout, sides, type Spacing } from './eraLayout'
import TimelineCard from './TimelineCard'
import useTimelineEraSectionsStyles from './TimelineEraSections.styles'
import TrilogyBracket from './TrilogyBracket'

type EraSectionProps = {
  headingId: string
  timeline: Timeline
  era?: TimelineEntry
  titles: TimelineEntry[]
  trilogies: TimelineEntry[]
  spacing: Spacing
  counts: Counts
  onSelect: (id: TimelineId) => void
}

const EraSection: FC<EraSectionProps> = ({
  headingId,
  timeline,
  era,
  titles,
  trilogies,
  spacing,
  counts,
  onSelect,
}) => {
  const { classes } = useTimelineEraSectionsStyles()
  const color = getEraColor({ timeline, id: era?.id })
  const { rows, brackets, getCell } = buildEraLayout({
    titles,
    trilogies,
    spacing,
  })

  return (
    <section
      aria-labelledby={headingId}
      className={classes.section}
      style={{
        '--era-color': color,
        gridTemplateRows: `auto ${rows
          .map(({ gap }) => (gap === undefined ? 'auto' : `${gap}px`))
          .join(' ')}`,
      }}
    >
      <h2 className={classes.header} id={headingId}>
        {era ? (
          <button
            type="button"
            onClick={() => onSelect(era.id)}
            className={classes.headerButton}
            style={{ background: color }}
          >
            {era.label}
            <span className={classes.headerRange}>
              {formatRange(timeline.getRange(era.id))}
            </span>
          </button>
        ) : (
          <span className={classes.headerPill} style={{ background: color }}>
            No era
          </span>
        )}
      </h2>
      {rows.map((row, index) => (
        <Fragment key={index}>
          <div
            aria-hidden={row.gap !== undefined || undefined}
            className={classes.axis}
            data-compressed={row.compressed || undefined}
            style={{ gridRow: index + 2 }}
          >
            {row.gap === undefined && (
              <span className={classes.year}>
                {row.empty
                  ? 'No titles yet'
                  : row.year === undefined
                    ? 'Undated'
                    : formatYear(row.year)}
              </span>
            )}
          </div>
          {row.gap === undefined &&
            sides.map((side) => {
              const inCell = getCell({ row, side })
              return inCell.length ? (
                <div
                  key={side}
                  className={
                    side === 'left' ? classes.leftCell : classes.rightCell
                  }
                  style={{
                    gridColumn: side === 'left' ? 2 : 4,
                    gridRow: index + 2,
                  }}
                >
                  {inCell.map((entry) => (
                    <TimelineCard
                      key={entry.id}
                      entry={entry}
                      side={side}
                      counts={counts}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              ) : null
            })}
        </Fragment>
      ))}
      {brackets.map((bracket) => (
        <TrilogyBracket
          key={`${bracket.trilogy.id}-${bracket.side}`}
          timeline={timeline}
          onSelect={onSelect}
          {...bracket}
        />
      ))}
    </section>
  )
}

export default EraSection
