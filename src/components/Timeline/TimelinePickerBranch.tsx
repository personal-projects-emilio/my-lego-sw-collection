import type { FC } from 'react'
import { MdLock } from 'react-icons/md'

import { Tooltip } from '@mui/material'
import type { TimelineEntry, TimelineId } from 'types/timeline'

import KindIcon from './KindIcon'
import {
  noteOf,
  pickStyle,
  type TimelinePickerProps,
  toggleProps,
} from './pickButton'
import useTimelinePickerStyles from './TimelinePicker.styles'

type NodeProps = { props: TimelinePickerProps; entry: TimelineEntry }

const Node: FC<NodeProps> = ({ props, entry }) => {
  const { classes, cx } = useTimelinePickerStyles()
  const children = props.timeline.childrenOf(entry.id)
  return (
    <>
      <Tooltip
        title={noteOf({ picks: props.picks, entry })}
        placement="right"
        describeChild
      >
        <button
          className={cx(
            classes.button,
            classes.node,
            !entry.kind && classes.groupNode
          )}
          style={pickStyle({ ...props, entry })}
          {...toggleProps({ ...props, entry })}
        >
          <KindIcon kind={entry.kind} />
          {entry.label}
          {props.picks.inherited[entry.id] && <MdLock aria-hidden />}
        </button>
      </Tooltip>
      {children.length > 0 && (
        <TimelinePickerBranch props={props} ids={children} />
      )}
    </>
  )
}

type TimelinePickerBranchProps = {
  props: TimelinePickerProps
  ids: TimelineId[]
}

const TimelinePickerBranch: FC<TimelinePickerBranchProps> = ({
  props,
  ids,
}) => {
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

export default TimelinePickerBranch
