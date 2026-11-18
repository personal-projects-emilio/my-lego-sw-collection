import type { TimelineEntry, TimelineId } from 'types/timeline'
import { inheritedFrom } from 'utils/tags'
import {
  canToggle,
  kindName,
  type Picks,
  pickStatus,
  type Timeline,
} from 'utils/timeline'

import { eraColor } from './eraColor'

export type TimelinePickerProps = {
  timeline: Timeline
  picks: Picks
  onToggle: (id: TimelineId) => void
}

type PickButton = TimelinePickerProps & { entry: TimelineEntry }

export const pickStyle = ({ timeline, picks, entry }: PickButton) => {
  const status = pickStatus({ timeline, picks, id: entry.id })
  const color = eraColor({ timeline, id: entry.id })
  return status === 'picked' || status === 'inherited'
    ? { background: color, color: 'rgba(0, 0, 0, 0.87)', borderColor: color }
    : status === 'implied'
      ? { background: `${color}26`, borderColor: color }
      : undefined
}

export const noteOf = ({
  picks,
  entry,
}: Pick<PickButton, 'picks' | 'entry'>) =>
  picks.inherited[entry.id] ? inheritedFrom(picks.inherited[entry.id]) : ''

export const toggleProps = ({
  timeline,
  picks,
  onToggle,
  entry,
}: PickButton) => {
  const status = pickStatus({ timeline, picks, id: entry.id })
  const enabled = canToggle({ timeline, picks, id: entry.id })
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
            noteOf({ picks, entry }),
            picks.value.includes(entry.id) && 'also picked',
          ]
            .filter(Boolean)
            .join(', ')
        : undefined,
    onClick: enabled ? () => onToggle(entry.id) : undefined,
  }
}
