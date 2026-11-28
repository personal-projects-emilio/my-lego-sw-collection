import {
  type FC,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useId,
  useRef,
  useState,
} from 'react'
import { MdArrowDropDown } from 'react-icons/md'

import {
  Autocomplete,
  ClickAwayListener,
  Paper,
  Popper,
  TextField,
} from '@mui/material'
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
  label?: ReactNode
  limitTags?: number
  onChange: (value: TimelineId[]) => void
  placeholder?: string
  popperClassName?: string
  size?: 'medium' | 'small'
  value: TimelineId[]
}

const noInherited: InheritedTimeline = {}

const openKeys = new Set(['ArrowDown', 'Enter', ' '])

const TimelineField: FC<TimelineFieldProps> = ({
  className,
  inherited = noInherited,
  inputRef,
  label = 'Timeline',
  limitTags,
  onChange,
  placeholder,
  popperClassName,
  size,
  value,
}) => {
  const { classes, theme } = useTimelineFieldStyles()
  const timeline = useTimeline()
  const anchorRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const reopenOnFocus = useRef(true)
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
  const open = Boolean(anchor)
  const inputId = useId()
  const panelId = useId()
  const picks = { value, inherited }
  const shown = timeline.getLeaves([...value, ...Object.keys(inherited)])
  const toggle = (id: TimelineId) =>
    onChange(togglePick({ timeline, picks, id }))
  const show = () => setAnchor(anchorRef.current)
  const close = ({ refocus }: { refocus: boolean }) => {
    setAnchor(null)
    if (!refocus) return
    reopenOnFocus.current = false
    document.getElementById(inputId)?.focus()
    reopenOnFocus.current = true
  }

  return (
    <div
      className={className}
      onBlur={(event: FocusEvent) => {
        const next = event.relatedTarget
        if (
          next instanceof Node &&
          (anchorRef.current?.contains(next) ||
            paperRef.current?.contains(next))
        )
          return
        setAnchor(null)
      }}
    >
      <div
        ref={anchorRef}
        onClick={(event) => {
          if (!(
            event.target instanceof Element &&
            event.target.closest('.MuiChip-deleteIcon')
          ))
            show()
        }}
      >
        <Autocomplete
          id={inputId}
          multiple
          className={classes.select}
          size={size}
          data-filled={shown.length > 0 || undefined}
          disableClearable
          open={false}
          options={shown}
          value={shown}
          inputValue=""
          getOptionLabel={timeline.getPathLabel}
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
              focused={open || undefined}
              inputRef={inputRef}
              label={label}
              placeholder={shown.length ? undefined : placeholder}
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  'aria-expanded': open,
                  'aria-controls': panelId,
                  'aria-haspopup': 'dialog',
                  'aria-autocomplete': 'none',
                  readOnly: true,
                  onFocus: () => {
                    if (reopenOnFocus.current) show()
                  },
                  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === 'Escape' && open) {
                      event.stopPropagation()
                      close({ refocus: false })
                    }
                    if (open && event.key === 'ArrowDown') {
                      event.preventDefault()
                      paperRef.current?.querySelector('button')?.focus()
                    }
                    if (!openKeys.has(event.key) || open) return
                    event.preventDefault()
                    show()
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
              limit={open ? undefined : limitTags}
            />
          )}
        />
      </div>
      <Popper
        anchorEl={anchor}
        className={popperClassName}
        container={anchor?.closest<HTMLElement>('.MuiModal-root')}
        open={open}
        placement="bottom-start"
        style={{ zIndex: theme.zIndex.modal }}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            if (!(
              event.target instanceof Node &&
              anchorRef.current?.contains(event.target)
            ))
              setAnchor(null)
          }}
        >
          <Paper
            ref={paperRef}
            id={panelId}
            role="group"
            aria-label="Timeline options"
            className={classes.panel}
            elevation={8}
            onKeyDown={(event) => {
              if (event.key !== 'Escape') return
              event.stopPropagation()
              close({ refocus: true })
            }}
            style={{ width: anchor?.clientWidth }}
            tabIndex={-1}
          >
            <TimelinePicker
              timeline={timeline}
              picks={picks}
              onToggle={toggle}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  )
}

export default TimelineField
