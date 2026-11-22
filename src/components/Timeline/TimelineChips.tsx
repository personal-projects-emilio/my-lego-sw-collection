import type { FC } from 'react'

import {
  type AutocompleteRenderValueGetItemProps,
  Typography,
} from '@mui/material'
import { useTimeline } from 'hooks'
import type { InheritedTimeline, TimelineId } from 'types/timeline'

import { getEraColor } from './getEraColor'
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
  const renderChip = ({ id, label }: { id: TimelineId; label: string }) => {
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
        aria-label={timeline.getPathLabel(parent)}
        className={classes.group}
        style={{
          '--era-color': getEraColor({ timeline, id: parent }),
        }}
      >
        <Typography variant="caption" aria-hidden>
          {timeline.getPathLabel(parent)} ›
        </Typography>
        {members.map((id) => renderChip({ id, label: timeline.getLabel(id) }))}
      </div>
    ) : (
      members.map((id) => renderChip({ id, label: timeline.getPathLabel(id) }))
    )
  )
}

export default TimelineChips
