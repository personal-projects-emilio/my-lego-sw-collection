import { type FC, type ReactNode, useState } from 'react'
import { MdExpandMore } from 'react-icons/md'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'

type ReportSectionProps = {
  title: string
  count: number
  countLabel?: string
  children: ReactNode
}

const ReportSection: FC<ReportSectionProps> = ({
  title,
  count,
  countLabel = String(count),
  children,
}) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <Accordion
      disabled={count === 0}
      expanded={expanded && count > 0}
      onChange={(_event, isExpanded) => setExpanded(isExpanded)}
      disableGutters
    >
      <AccordionSummary expandIcon={<MdExpandMore />}>
        <Typography>
          {title} ({countLabel})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}

export default ReportSection
