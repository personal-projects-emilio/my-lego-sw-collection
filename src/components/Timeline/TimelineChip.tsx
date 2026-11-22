import type { FC } from 'react'
import { MdLock } from 'react-icons/md'

import { Chip, type ChipProps, Tooltip } from '@mui/material'
import { useTimeline } from 'hooks'
import type { TimelineId } from 'types/timeline'
import { formatInheritedFrom } from 'utils/tags'

import { getEraColor } from './getEraColor'
import KindIcon from './KindIcon'
import useTimelineFieldStyles from './TimelineField.styles'

type TimelineChipProps = Omit<ChipProps, 'label'> & {
  id: TimelineId
  label: string
  sources?: Array<string | number>
}

const TimelineChip: FC<TimelineChipProps> = ({
  id,
  label,
  sources,
  ...chipProps
}) => {
  const { classes } = useTimelineFieldStyles()
  const timeline = useTimeline()
  const entry = timeline.entry(id)
  if (!entry) return null
  return (
    <Tooltip title={sources ? formatInheritedFrom(sources) : ''} describeChild>
      <Chip
        {...chipProps}
        aria-label={
          sources ? `${label}, ${formatInheritedFrom(sources)}` : undefined
        }
        size="small"
        className={classes.chip}
        style={{ '--era-color': getEraColor({ timeline, id }) }}
        icon={<KindIcon kind={entry.kind} />}
        label={
          <span className={classes.chipLabel}>
            {label}
            {sources && <MdLock className={classes.lock} aria-hidden />}
          </span>
        }
        onDelete={sources ? undefined : chipProps.onDelete}
      />
    </Tooltip>
  )
}

export default TimelineChip
