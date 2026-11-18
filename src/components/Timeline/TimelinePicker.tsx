import type { FC } from 'react'
import { MdLock } from 'react-icons/md'

import { Tooltip } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import type { TimelineEntry, TimelineId } from 'types/timeline'
import { inheritedFrom } from 'utils/tags'
import {
  canToggle,
  formatRange,
  kindName,
  type Picks,
  pickStatus,
  type Timeline,
} from 'utils/timeline'

import { eraColor } from './eraColor'
import KindIcon from './KindIcon'

const useTimelinePickerStyles = makeStyles({ name: 'TimelinePicker' })(
  (theme) => ({
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      rowGap: theme.spacing(2.5),
      alignItems: 'start',
    },
    era: { minWidth: 0 },
    button: {
      font: 'inherit',
      color: 'inherit',
      background: 'transparent',
      textAlign: 'left',
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 1,
      },
      '&[aria-disabled="true"]': { cursor: 'default' },
    },
    eraLine: {
      position: 'relative',
      height: 16,
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        borderTop: '3px solid var(--era-color)',
      },
    },
    dot: {
      position: 'relative',
      zIndex: 1,
      width: 16,
      height: 16,
      marginLeft: theme.spacing(1),
      borderRadius: '50%',
      border: '3px solid var(--era-color)',
      background: theme.palette.background.paper,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 9,
      color: 'rgba(0, 0, 0, 0.87)',
    },
    eraName: {
      display: 'inline-flex',
      flexDirection: 'column',
      margin: theme.spacing(0.5, 0, 0.5, 0.5),
      padding: theme.spacing(0.25, 1),
      borderRadius: 4,
      border: '1px solid transparent',
      fontWeight: 700,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      cursor: 'pointer',
      '&:hover:not([aria-disabled="true"])': {
        background: theme.palette.action.hover,
        boxShadow: 'inset 0 0 0 2px currentColor',
      },
    },
    eraRange: {
      fontSize: 11,
      fontWeight: 400,
      textTransform: 'none',
      letterSpacing: 0,
      opacity: 0.7,
    },
    branch: {
      listStyle: 'none',
      margin: theme.spacing(0, 1, 0, 2),
      padding: 0,
    },
    child: {
      paddingLeft: theme.spacing(1.5),
      position: 'relative',
      '&::before': {
        borderBottom: `1px solid ${theme.palette.text.disabled}`,
        content: '""',
        height: 13,
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
    node: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      maxWidth: '100%',
      fontSize: 13,
      lineHeight: '20px',
      padding: '1px 6px',
      margin: '1px 0',
      borderRadius: 4,
      border: '1px solid transparent',
      cursor: 'pointer',
      '& svg': { flexShrink: 0 },
      '&:hover:not([aria-disabled="true"])': {
        background: theme.palette.action.hover,
        boxShadow: 'inset 0 0 0 2px currentColor',
      },
    },
    groupNode: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    eraLabel: { display: 'inline-flex', alignItems: 'center', gap: 4 },
  })
)

export type TimelinePickerProps = {
  timeline: Timeline
  picks: Picks
  onToggle: (id: TimelineId) => void
}

const pickStyle = (
  { timeline, picks }: TimelinePickerProps,
  entry: TimelineEntry
) => {
  const status = pickStatus(timeline, picks, entry.id)
  const color = eraColor(timeline, entry.id)
  return status === 'picked' || status === 'inherited'
    ? { background: color, color: 'rgba(0, 0, 0, 0.87)', borderColor: color }
    : status === 'implied'
      ? { background: `${color}26`, borderColor: color }
      : undefined
}

const noteOf = ({ picks }: TimelinePickerProps, entry: TimelineEntry) =>
  picks.inherited[entry.id] ? inheritedFrom(picks.inherited[entry.id]) : ''

const toggleProps = (props: TimelinePickerProps, entry: TimelineEntry) => {
  const { timeline, picks, onToggle } = props
  const status = pickStatus(timeline, picks, entry.id)
  const enabled = canToggle(timeline, picks, entry.id)
  return {
    type: 'button' as const,
    'aria-pressed':
      status === 'implied' ? ('mixed' as const) : status !== 'none',
    'aria-disabled': !enabled || undefined,
    'aria-label':
      status === 'inherited'
        ? [
            entry.kind && kindName(entry.kind),
            entry.label,
            noteOf(props, entry),
            picks.value.includes(entry.id) && 'also picked',
          ]
            .filter(Boolean)
            .join(', ')
        : undefined,
    onClick: enabled ? () => onToggle(entry.id) : undefined,
  }
}

type NodeProps = { props: TimelinePickerProps; entry: TimelineEntry }

const Node: FC<NodeProps> = ({ props, entry }) => {
  const { classes, cx } = useTimelinePickerStyles()
  const children = props.timeline.childrenOf(entry.id)
  return (
    <>
      <Tooltip title={noteOf(props, entry)} placement="right" describeChild>
        <button
          className={cx(
            classes.button,
            classes.node,
            !entry.kind && classes.groupNode
          )}
          style={pickStyle(props, entry)}
          {...toggleProps(props, entry)}
        >
          <KindIcon kind={entry.kind} />
          {entry.label}
          {props.picks.inherited[entry.id] && <MdLock aria-hidden />}
        </button>
      </Tooltip>
      {children.length > 0 && <Branch props={props} ids={children} />}
    </>
  )
}

type BranchProps = { props: TimelinePickerProps; ids: TimelineId[] }

const Branch: FC<BranchProps> = ({ props, ids }) => {
  const { classes } = useTimelinePickerStyles()
  return (
    <ul className={classes.branch}>
      {ids.flatMap((id) => {
        const entry = props.timeline.entry(id)
        return entry
          ? [
              <li key={id} className={classes.child}>
                <Node props={props} entry={entry} />
              </li>,
            ]
          : []
      })}
    </ul>
  )
}

const TimelinePicker: FC<TimelinePickerProps> = (props) => {
  const { classes, cx, theme } = useTimelinePickerStyles()
  const { timeline, picks } = props
  const looseTitles = timeline
    .childrenOf(undefined)
    .filter((id) => timeline.entry(id)?.kind)
  const sections = [
    ...timeline.erasWithTitles.map((era) => ({
      era,
      ids: timeline.childrenOf(era.id),
    })),
    ...(looseTitles.length ? [{ era: undefined, ids: looseTitles }] : []),
  ]

  return (
    <div className={classes.grid}>
      {sections.map(({ era, ids }) => {
        const color = eraColor(timeline, era?.id)
        const status = era ? pickStatus(timeline, picks, era.id) : 'none'
        return (
          <div
            key={era?.id ?? 'none'}
            role="group"
            aria-label={era?.label ?? 'No era'}
            className={classes.era}
            style={{ ['--era-color' as string]: color }}
          >
            <div className={classes.eraLine} aria-hidden>
              <span
                className={classes.dot}
                style={
                  status === 'picked' || status === 'inherited'
                    ? { background: color }
                    : status === 'implied'
                      ? {
                          background: `color-mix(in srgb, ${color} 45%, ${theme.palette.background.paper})`,
                        }
                      : undefined
                }
              >
                {status === 'inherited' && <MdLock />}
              </span>
            </div>
            {era ? (
              <Tooltip
                title={noteOf(props, era)}
                placement="top-start"
                describeChild
              >
                <button
                  className={cx(classes.button, classes.eraName)}
                  style={pickStyle(props, era)}
                  {...toggleProps(props, era)}
                >
                  <span className={classes.eraLabel}>
                    {era.label}
                    {picks.inherited[era.id] && <MdLock aria-hidden />}
                  </span>
                  <span className={classes.eraRange}>
                    {formatRange(timeline.range(era.id))}
                  </span>
                </button>
              </Tooltip>
            ) : (
              <span className={classes.eraName}>No era</span>
            )}
            <Branch props={props} ids={ids} />
          </div>
        )
      })}
    </div>
  )
}

export default TimelinePicker
