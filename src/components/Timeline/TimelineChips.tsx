import type { FC } from 'react'

import {
  type AutocompleteRenderValueGetItemProps,
  Typography,
} from '@mui/material'
import { useTimeline } from 'hooks'
import type { InheritedTimeline, TimelineId } from 'types/timeline'

import { eraColor } from './eraColor'
import TimelineChip from './TimelineChip'
import useTimelineFieldStyles from './TimelineField.styles'

type TimelineChipsProps = {
  ids: TimelineId[]
  inherited: InheritedTimeline
  getItemProps: AutocompleteRenderValueGetItemProps<true>
}

const TimelineChips: FC<TimelineChipsProps> = ({
  ids,
  inherited,
  getItemProps,
}) => {
  const { classes } = useTimelineFieldStyles()
  const timeline = useTimeline()
  const groups = ids.reduce<Array<{ parent?: TimelineId; ids: TimelineId[] }>>(
    (result, id) => {
      const parent = timeline.entry(id)?.parent
      const existing = parent && result.find((group) => group.parent === parent)
      if (existing) existing.ids.push(id)
      else result.push({ parent, ids: [id] })
      return result
    },
    []
  )
  const chip = ({ id, label }: { id: TimelineId; label: string }) => {
    const { key, ...itemProps } = getItemProps({ index: ids.indexOf(id) })
    return (
      <TimelineChip
        key={key}
        {...itemProps}
        id={id}
        label={label}
        sources={inherited[id]}
      />
    )
  }

  return groups.map(({ parent, ids: members }) =>
    parent && members.length > 1 ? (
      <div
        key={`group-${parent}`}
        role="group"
        aria-label={timeline.pathLabel(parent)}
        className={classes.group}
        style={{
          '--era-color': eraColor({ timeline, id: parent }),
        }}
      >
        <Typography variant="caption" aria-hidden>
          {timeline.pathLabel(parent)} ›
        </Typography>
        {members.map((id) => chip({ id, label: timeline.label(id) }))}
      </div>
    ) : (
      members.map((id) => chip({ id, label: timeline.pathLabel(id) }))
    )
  )
}

export default TimelineChips
