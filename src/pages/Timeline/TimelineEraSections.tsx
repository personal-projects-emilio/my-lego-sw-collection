import { type FC, Fragment, useId, useState } from 'react'

import { FormControlLabel, Switch } from '@mui/material'
import { eraColor, KindIcon } from 'components/Timeline'
import { makeStyles } from 'tss-react/mui'
import type { TimelineEntry, TimelineId } from 'types/timeline'
import { formatRange, formatYear, type Timeline } from 'utils/timeline'

import { countLabel, type Counts } from './counts'

const pxPerYear = 14
const maxGap = 90

const useStyles = makeStyles({ name: 'TimelineEraSections' })((theme) => ({
  root: {
    maxWidth: 960,
    margin: '0 auto',
    padding: theme.spacing(3, 2, 12),
  },
  toolbar: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(1, 0),
    background: theme.palette.background.default,
  },
  section: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 96px 1fr 40px',
    columnGap: theme.spacing(1),
  },
  header: {
    gridColumn: '1 / -1',
    margin: 0,
    fontSize: 'inherit',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    padding: theme.spacing(1.5, 0),
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '50%',
      width: 4,
      marginLeft: -2,
      background: 'var(--era-color)',
    },
  },
  clickable: { cursor: 'pointer' },
  focusable: {
    font: 'inherit',
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
  headerPill: {
    border: 'none',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(0.75, 2.5),
    borderRadius: 999,
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    boxShadow: theme.shadows[2],
    transition: 'box-shadow 150ms',
    '&:hover': {
      boxShadow: `0 0 0 3px ${theme.palette.text.primary}, ${theme.shadows[2]}`,
    },
  },
  headerRange: {
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: 0.5,
    textTransform: 'none',
    opacity: 0.9,
  },
  axis: {
    gridColumn: 3,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '50%',
      width: 4,
      marginLeft: -2,
      background: 'var(--era-color)',
    },
  },
  compressed: {
    '&::before': {
      background:
        'repeating-linear-gradient(to bottom, var(--era-color) 0 6px, transparent 6px 12px)',
    },
  },
  year: {
    position: 'relative',
    zIndex: 1,
    fontSize: 11,
    fontWeight: 700,
    padding: theme.spacing(0.25, 1),
    borderRadius: 999,
    background: theme.palette.background.paper,
    border: '2px solid var(--era-color)',
    whiteSpace: 'nowrap',
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: theme.spacing(0.5, 0),
    justifyContent: 'center',
  },
  leftCell: { alignItems: 'flex-end' },
  rightCell: { alignItems: 'flex-start' },
  card: {
    color: 'inherit',
    textAlign: 'left',
    position: 'relative',
    width: '100%',
    maxWidth: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    '& > svg': { flexShrink: 0, fontSize: 18, color: 'var(--era-color)' },
    '&:hover': {
      borderColor: 'var(--era-color)',
      boxShadow: '0 0 0 2px var(--era-color)',
    },
  },
  leftCard: {
    flexDirection: 'row-reverse',
    textAlign: 'right',
    '&::after': {
      content: '""',
      position: 'absolute',
      right: `calc(-1 * ${theme.spacing(1)})`,
      width: theme.spacing(1),
      top: '50%',
      borderTop: '2px solid var(--era-color)',
    },
  },
  rightCard: {
    '&::after': {
      content: '""',
      position: 'absolute',
      left: `calc(-1 * ${theme.spacing(1)})`,
      width: theme.spacing(1),
      top: '50%',
      borderTop: '2px solid var(--era-color)',
    },
  },
  cardText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  cardTitle: { fontWeight: 700, fontSize: 14, lineHeight: 1.2 },
  meta: { fontSize: 11, color: theme.palette.text.secondary },
  bracket: {
    color: 'inherit',
    background: 'transparent',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(0.5, 0),
    border: '2px solid var(--era-color)',
    '&:hover': {
      background: 'color-mix(in srgb, var(--era-color) 35%, transparent)',
    },
  },
  leftBracket: { borderRight: 'none', borderRadius: '8px 0 0 8px' },
  rightBracket: { borderLeft: 'none', borderRadius: '0 8px 8px 0' },
  bracketLabel: {
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
  },
}))

type Row = {
  year?: number
  gap?: number
  compressed?: boolean
  empty?: boolean
}

type TimelineEraSectionsProps = {
  timeline: Timeline
  counts: Counts
  onSelect: (id: TimelineId) => void
}

const TimelineEraSections: FC<TimelineEraSectionsProps> = ({
  timeline,
  counts,
  onSelect,
}) => {
  const { classes, cx } = useStyles()
  const headingId = useId()
  const [spacing, setSpacing] = useState<'ordinal' | 'proportional'>('ordinal')
  const sections = [...timeline.eras, undefined]
    .map((era) => ({
      era,
      titles: timeline.titles.filter(
        (title) => timeline.eraOf(title.id) === era
      ),
      trilogies: timeline.trilogies.filter(
        (trilogy) => timeline.eraOf(trilogy.id) === era
      ),
    }))
    .filter(({ era, titles }) => era || titles.length)

  const card = (entry: TimelineEntry, side: 'left' | 'right') => (
    <button
      key={entry.id}
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
          {countLabel(counts, entry.id)}
        </span>
      </span>
    </button>
  )

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        <FormControlLabel
          control={
            <Switch
              checked={spacing === 'proportional'}
              onChange={(_, checked) =>
                setSpacing(checked ? 'proportional' : 'ordinal')
              }
            />
          }
          label="Space by years"
        />
      </div>
      {sections.map(({ era, titles, trilogies }) => {
        const color = eraColor(timeline, era?.id)
        const years = [
          ...new Set(
            titles.flatMap(({ start }) => (start === undefined ? [] : [start]))
          ),
        ].sort((a, b) => a - b)
        const rows: Row[] = years.flatMap((year, index) => {
          const gap = index ? year - years[index - 1] - 1 : 0
          const spacer: Row[] =
            spacing === 'proportional' && gap > 0
              ? [
                  {
                    gap: Math.min(gap * pxPerYear, maxGap),
                    compressed: gap * pxPerYear > maxGap,
                  },
                ]
              : []
          return [...spacer, { year }]
        })
        if (titles.some(({ start }) => start === undefined)) rows.push({})
        const emptyTrilogies = trilogies.filter(
          (trilogy) => !titles.some(({ parent }) => parent === trilogy.id)
        )
        if (emptyTrilogies.length) rows.push({ empty: true })
        const rowOf = (entry: TimelineEntry) =>
          rows.findIndex(
            ({ year, gap, empty }) =>
              gap === undefined && !empty && year === entry.start
          ) + 2
        const side = (entry: TimelineEntry) =>
          entry.kind === 'movie' ? 'left' : 'right'
        const brackets = trilogies.flatMap((trilogy) =>
          (['left', 'right'] as const)
            .flatMap((bracketSide) => {
              const children = titles.filter(
                (title) =>
                  title.parent === trilogy.id && side(title) === bracketSide
              )
              if (!children.length) return []
              const childRows = children.map(rowOf)
              return [
                {
                  trilogy,
                  bracketSide,
                  from: Math.min(...childRows),
                  to: Math.max(...childRows),
                },
              ]
            })
            .map((bracket, index) => ({ ...bracket, duplicate: index > 0 }))
        )
        return (
          <section
            key={era?.id ?? 'none'}
            aria-labelledby={`${headingId}-${era?.id ?? 'none'}`}
            className={classes.section}
            style={{
              ['--era-color' as string]: color,
              gridTemplateRows: `auto ${rows
                .map(({ gap }) => (gap === undefined ? 'auto' : `${gap}px`))
                .join(' ')}`,
            }}
          >
            <h2
              className={classes.header}
              id={`${headingId}-${era?.id ?? 'none'}`}
            >
              {era ? (
                <button
                  type="button"
                  onClick={() => onSelect(era.id)}
                  className={cx(
                    classes.focusable,
                    classes.headerPill,
                    classes.clickable
                  )}
                  style={{ background: color }}
                >
                  {era.label}
                  <span className={classes.headerRange}>
                    {formatRange(timeline.range(era.id))}
                  </span>
                </button>
              ) : (
                <span
                  className={classes.headerPill}
                  style={{ background: color }}
                >
                  No era
                </span>
              )}
            </h2>
            {rows.map((row, index) => (
              <Fragment key={index}>
                <div
                  aria-hidden={row.gap !== undefined || undefined}
                  className={cx(
                    classes.axis,
                    row.compressed && classes.compressed
                  )}
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
                  (['left', 'right'] as const).map((cellSide) => {
                    const inCell = row.empty
                      ? cellSide === 'right'
                        ? emptyTrilogies
                        : []
                      : titles.filter(
                          (title) =>
                            title.start === row.year && side(title) === cellSide
                        )
                    return inCell.length ? (
                      <div
                        key={cellSide}
                        className={cx(
                          classes.cell,
                          cellSide === 'left'
                            ? classes.leftCell
                            : classes.rightCell
                        )}
                        style={{
                          gridColumn: cellSide === 'left' ? 2 : 4,
                          gridRow: index + 2,
                        }}
                      >
                        {inCell.map((title) => card(title, cellSide))}
                      </div>
                    ) : null
                  })}
              </Fragment>
            ))}
            {brackets.map(({ trilogy, bracketSide, from, to, duplicate }) => (
              <button
                key={`${trilogy.id}-${bracketSide}`}
                type="button"
                onClick={() => onSelect(trilogy.id)}
                aria-hidden={duplicate || undefined}
                tabIndex={duplicate ? -1 : undefined}
                className={cx(
                  classes.focusable,
                  classes.bracket,
                  classes.clickable,
                  bracketSide === 'left'
                    ? classes.leftBracket
                    : classes.rightBracket
                )}
                style={{
                  gridColumn: bracketSide === 'left' ? 1 : 5,
                  gridRow: `${from} / ${to + 1}`,
                }}
                title={formatRange(timeline.range(trilogy.id))}
              >
                <span className={classes.bracketLabel}>{trilogy.label}</span>
              </button>
            ))}
          </section>
        )
      })}
    </div>
  )
}

export default TimelineEraSections
