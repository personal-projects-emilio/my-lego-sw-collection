import {
  type FC,
  type KeyboardEvent,
  type Ref,
  useId,
  useRef,
  useState,
} from 'react'
import { MdArrowDropDown } from 'react-icons/md'

import { Autocomplete, Popover, TextField } from '@mui/material'
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
  popoverClassName?: string
  value: TimelineId[]
}

const noInherited: InheritedTimeline = {}

const openKeys = new Set(['ArrowDown', 'Enter', ' '])

const TimelineField: FC<TimelineFieldProps> = ({
  className,
  inherited = noInherited,
  inputRef,
  label = 'Timeline',
  onChange,
  popoverClassName,
  value,
}) => {
  const { classes } = useTimelineFieldStyles()
  const timeline = useTimeline()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
  const open = Boolean(anchor)
  const panelId = useId()
  const picks = { value, inherited }
  const shown = timeline.leaves([...value, ...Object.keys(inherited)])
  const toggle = (id: TimelineId) =>
    onChange(togglePick({ timeline, picks, id }))

  return (
    <div className={className}>
      <div
        ref={anchorRef}
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest('.MuiChip-deleteIcon'))
            setAnchor(anchorRef.current)
        }}
      >
        <Autocomplete
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
                  'aria-haspopup': 'dialog',
                  'aria-autocomplete': 'none',
                  readOnly: true,
                  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                    if (!openKeys.has(event.key)) return
                    event.preventDefault()
                    setAnchor(anchorRef.current)
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
      <Popover
        anchorEl={anchor}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        className={popoverClassName}
        onClose={() => setAnchor(null)}
        open={open}
        slotProps={{
          paper: {
            className: classes.panel,
            style: { width: anchor?.clientWidth },
          },
        }}
      >
        <div id={panelId} role="group" aria-label="Timeline options">
          <TimelinePicker timeline={timeline} picks={picks} onToggle={toggle} />
        </div>
      </Popover>
    </div>
  )
}

export default TimelineField
