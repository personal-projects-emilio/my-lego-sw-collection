import type { FC } from 'react'
import { MdLock } from 'react-icons/md'

import { Tooltip } from '@mui/material'
import { formatRange, pickStatus } from 'utils/timeline'

import { getEraColor } from './getEraColor'
import {
  getPickNote,
  pickStyle,
  type TimelinePickerProps,
  toggleProps,
} from './pickButton'
import useTimelinePickerStyles from './TimelinePicker.styles'
import TimelinePickerBranch from './TimelinePickerBranch'

export type { TimelinePickerProps } from './pickButton'

const TimelinePicker: FC<TimelinePickerProps> = (props) => {
  const { classes, theme } = useTimelinePickerStyles()
  const { timeline, picks } = props
  const looseTitles = timeline
    .getChildren(undefined)
    .filter((id) => timeline.entry(id)?.kind)
  const sections = [
    ...timeline.erasWithTitles.map((era) => ({
      era,
      ids: timeline.getChildren(era.id),
    })),
    ...(looseTitles.length ? [{ era: undefined, ids: looseTitles }] : []),
  ]

  return (
    <div className={classes.grid}>
      {sections.map(({ era, ids }) => {
        const color = getEraColor({ timeline, id: era?.id })
        const status = era
          ? pickStatus({ timeline, picks, id: era.id })
          : 'none'
        return (
          <div
            key={era?.id ?? 'none'}
            role="group"
            aria-label={era?.label ?? 'No era'}
            className={classes.era}
            style={{ '--era-color': color }}
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
                title={getPickNote({ picks, entry: era })}
                placement="top-start"
                describeChild
              >
                <button
                  className={classes.eraButton}
                  style={pickStyle({ ...props, entry: era })}
                  {...toggleProps({ ...props, entry: era })}
                >
                  <span className={classes.eraLabel}>
                    {era.label}
                    {picks.inherited[era.id] && <MdLock aria-hidden />}
                  </span>
                  <span className={classes.eraRange}>
                    {formatRange(timeline.getRange(era.id))}
                  </span>
                </button>
              </Tooltip>
            ) : (
              <span className={classes.eraName}>No era</span>
            )}
            <TimelinePickerBranch props={props} ids={ids} />
          </div>
        )
      })}
    </div>
  )
}

export default TimelinePicker
