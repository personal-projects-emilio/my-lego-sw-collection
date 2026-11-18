import {
  type FC,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
  useId,
  useRef,
  useState,
} from 'react'
import { MdArrowDropDown, MdLock } from 'react-icons/md'

import {
  Autocomplete,
  Chip,
  Collapse,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTimeline } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { InheritedAppearances, TimelineId } from 'types/timeline'
import { inheritedFrom } from 'utils/tags'
import { togglePick } from 'utils/timeline'

import { eraColor } from './eraColor'
import KindIcon from './KindIcon'
import TimelinePicker from './TimelinePicker'

const useTimelineFieldStyles = makeStyles({ name: 'TimelineField' })(
  (theme) => ({
    group: {
      alignItems: 'center',
      background: 'var(--era-color)',
      color: 'rgba(0, 0, 0, 0.87)',
      borderRadius: theme.spacing(2),
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: theme.spacing(0.75),
      margin: theme.spacing(0.5),
      padding: theme.spacing(0.5, 0.5, 0.5, 1.25),
      '& .MuiChip-root': {
        background: 'rgba(255, 255, 255, 0.45)',
        margin: 0,
      },
    },
    chip: {
      background: 'var(--era-color)',
      margin: theme.spacing(0.5),
      padding: theme.spacing(0, 0.5),
      color: 'rgba(0, 0, 0, 0.87)',
      '& .MuiChip-icon': { color: 'inherit', fontSize: 14 },
      '& .MuiChip-deleteIcon': {
        color: 'rgba(0, 0, 0, 0.5)',
        '&:hover': { color: 'rgba(0, 0, 0, 0.87)' },
      },
    },
    chipLabel: { display: 'inline-flex', alignItems: 'center', gap: 4 },
    select: {
      '& .MuiInputBase-root, & .MuiAutocomplete-input': { cursor: 'pointer' },
      '& .MuiAutocomplete-input': { caretColor: 'transparent' },
    },
    noInput: {
      '& .MuiAutocomplete-input': {
        flexGrow: '0 !important',
        minWidth: '0 !important',
        width: '0 !important',
        padding: '0 !important',
      },
    },
    lock: { opacity: 0.8 },
    chevron: { transition: 'transform 150ms' },
    chevronOpen: { transform: 'rotate(180deg)' },
    panel: {
      marginTop: theme.spacing(1),
      padding: theme.spacing(1.5),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
    },
  })
)

type TimelineFieldProps = {
  className?: string
  inherited?: InheritedAppearances
  inputRef?: Ref<HTMLInputElement>
  label?: string
  onChange: (value: TimelineId[]) => void
  openOnFocus?: boolean
  value: TimelineId[]
}

const noInherited: InheritedAppearances = {}

const TimelineField: FC<TimelineFieldProps> = ({
  className,
  inherited = noInherited,
  inputRef,
  label = 'Timeline',
  onChange,
  openOnFocus = false,
  value,
}) => {
  const { classes, cx } = useTimelineFieldStyles()
  const timeline = useTimeline()
  const [open, setOpen] = useState(false)
  const openedByFocus = useRef(false)
  const pointerDown = useRef(false)
  const inputId = useId()
  const panelId = useId()
  const picks = { value, inherited }
  const shown = timeline.leaves([...value, ...Object.keys(inherited)])
  const groups = shown.reduce<
    Array<{ parent?: TimelineId; ids: TimelineId[] }>
  >((result, id) => {
    const parent = timeline.entry(id)?.parent
    const existing = parent && result.find((group) => group.parent === parent)
    if (existing) existing.ids.push(id)
    else result.push({ parent, ids: [id] })
    return result
  }, [])
  const toggle = (id: TimelineId) => onChange(togglePick(timeline, picks, id))

  return (
    <div className={className}>
      <div
        onMouseDown={() => {
          pointerDown.current = true
        }}
        onClick={(event) => {
          pointerDown.current = false
          if (openedByFocus.current) {
            openedByFocus.current = false
            return
          }
          if (!(event.target as HTMLElement).closest('.MuiChip-deleteIcon'))
            setOpen(!open)
        }}
      >
        <Autocomplete
          id={inputId}
          multiple
          className={cx(classes.select, shown.length > 0 && classes.noInput)}
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
              className={cx(classes.chevron, open && classes.chevronOpen)}
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
                  onFocus: (event: FocusEvent<HTMLInputElement>) => {
                    params.slotProps.htmlInput.onFocus?.(event)
                    if (!openOnFocus || open) return
                    openedByFocus.current = pointerDown.current
                    setOpen(true)
                  },
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    params.slotProps.htmlInput.onBlur?.(event)
                    openedByFocus.current = false
                  },
                  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                    openedByFocus.current = false
                    const next =
                      event.key === 'Escape'
                        ? false
                        : event.key === 'ArrowDown'
                          ? true
                          : event.key === 'Enter' || event.key === ' '
                            ? !open
                            : open
                    if (next === open) return
                    event.preventDefault()
                    setOpen(next)
                  },
                },
              }}
            />
          )}
          renderValue={(values, getItemProps) => {
            const chip = (id: TimelineId, label: string) => {
              const entry = timeline.entry(id)
              if (!entry) return null
              const sources = inherited[id]
              const { key, onDelete, ...itemProps } = getItemProps({
                index: values.indexOf(id),
              })
              return (
                <Tooltip
                  key={key}
                  title={sources ? inheritedFrom(sources) : ''}
                  describeChild
                >
                  <Chip
                    {...itemProps}
                    aria-label={
                      sources
                        ? `${label}, ${inheritedFrom(sources)}`
                        : undefined
                    }
                    size="small"
                    className={classes.chip}
                    style={{
                      ['--era-color' as string]: eraColor(timeline, id),
                    }}
                    icon={<KindIcon kind={entry.kind} />}
                    label={
                      <span className={classes.chipLabel}>
                        {label}
                        {sources && (
                          <MdLock className={classes.lock} aria-hidden />
                        )}
                      </span>
                    }
                    onDelete={sources ? undefined : onDelete}
                  />
                </Tooltip>
              )
            }
            return groups.map(({ parent, ids }) =>
              parent && ids.length > 1 ? (
                <div
                  key={`group-${parent}`}
                  role="group"
                  aria-label={timeline.pathLabel(parent)}
                  className={classes.group}
                  style={{
                    ['--era-color' as string]: eraColor(timeline, parent),
                  }}
                >
                  <Typography variant="caption" aria-hidden>
                    {timeline.pathLabel(parent)} ›
                  </Typography>
                  {ids.map((id) => chip(id, timeline.label(id)))}
                </div>
              ) : (
                ids.map((id) => chip(id, timeline.pathLabel(id)))
              )
            )
          }}
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
