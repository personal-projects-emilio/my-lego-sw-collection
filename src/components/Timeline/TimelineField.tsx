import { type FC, type KeyboardEvent, type Ref, useId, useState } from 'react'
import { MdArrowDropDown } from 'react-icons/md'

import { Autocomplete, Collapse, TextField } from '@mui/material'
import { useTimeline } from 'hooks'
import type { InheritedTimeline, TimelineId } from 'types/timeline'
import { togglePick } from 'utils/timeline'

import TimelineChips from './TimelineChips'
import useTimelineFieldStyles from './TimelineField.styles'
import TimelinePicker from './TimelinePicker'

type TimelineFieldProps = {
  className?: string
  inherited?: InheritedTimeline
  inputRef?: Ref<HTMLInputElement>
  label?: string
  onChange: (value: TimelineId[]) => void
  defaultOpen?: boolean
  value: TimelineId[]
}

const noInherited: InheritedTimeline = {}

const mapKeysToActions: Record<string, (open: boolean) => boolean> = {
  ArrowDown: () => true,
  Enter: (open) => !open,
  ' ': (open) => !open,
  Escape: () => false,
}

const TimelineField: FC<TimelineFieldProps> = ({
  className,
  inherited = noInherited,
  inputRef,
  label = 'Timeline',
  onChange,
  defaultOpen = false,
  value,
}) => {
  const { classes } = useTimelineFieldStyles()
  const timeline = useTimeline()
  const [open, setOpen] = useState(defaultOpen)
  const inputId = useId()
  const panelId = useId()
  const picks = { value, inherited }
  const shown = timeline.leaves([...value, ...Object.keys(inherited)])
  const toggle = (id: TimelineId) =>
    onChange(togglePick({ timeline, picks, id }))

  return (
    <div className={className}>
      <div
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest('.MuiChip-deleteIcon'))
            setOpen(!open)
        }}
      >
        <Autocomplete
          id={inputId}
          multiple
          className={classes.select}
          data-filled={shown.length > 0 || undefined}
          disableClearable
          open={false}
          options={shown}
          value={shown}
          inputValue=""
          getOptionLabel={timeline.pathLabel}
          onChange={(_, next) =>
            shown
              .filter((id) => !next.includes(id) && !inherited[id])
              .forEach(toggle)
          }
          popupIcon={
            <MdArrowDropDown
              className={classes.chevron}
              data-open={open || undefined}
            />
          }
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={inputRef}
              label={label}
              placeholder={
                shown.length ? undefined : 'Pick eras, trilogies or titles'
              }
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  'aria-expanded': open,
                  'aria-controls': panelId,
                  'aria-autocomplete': 'none',
                  readOnly: true,
                  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                    const next = mapKeysToActions[event.key]?.(open)
                    if (next === undefined || next === open) return
                    event.preventDefault()
                    setOpen(next)
                  },
                },
              }}
            />
          )}
          renderValue={(values, getItemProps) => (
            <TimelineChips
              ids={values}
              inherited={inherited}
              getItemProps={getItemProps}
            />
          )}
        />
      </div>
      <Collapse in={open}>
        <div
          id={panelId}
          role="group"
          aria-label="Timeline options"
          className={classes.panel}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.stopPropagation()
            setOpen(false)
            document.getElementById(inputId)?.focus()
          }}
        >
          <TimelinePicker timeline={timeline} picks={picks} onToggle={toggle} />
        </div>
      </Collapse>
    </div>
  )
}

export default TimelineField
