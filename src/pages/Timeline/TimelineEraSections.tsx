import { type FC, useId, useState } from 'react'

import { FormControlLabel, Switch } from '@mui/material'
import type { TimelineId } from 'types/timeline'
import type { Timeline } from 'utils/timeline'

import type { Counts } from './counts'
import type { Spacing } from './eraLayout'
import EraSection from './EraSection'
import useTimelineEraSectionsStyles from './TimelineEraSections.styles'

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
  const { classes } = useTimelineEraSectionsStyles()
  const headingId = useId()
  const [spacing, setSpacing] = useState<Spacing>('ordinal')
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
      {sections.map(({ era, titles, trilogies }) => (
        <EraSection
          key={era?.id ?? 'none'}
          headingId={`${headingId}-${era?.id ?? 'none'}`}
          timeline={timeline}
          era={era}
          titles={titles}
          trilogies={trilogies}
          spacing={spacing}
          counts={counts}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default TimelineEraSections
