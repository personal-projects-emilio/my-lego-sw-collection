import { type FC, useEffect } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

import { IconButton, Paper, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export type PrototypeVariant = { key: string; name: string }

type PrototypeSwitcherProps = {
  current: string
  details?: string
  onSelect: (key: string) => void
  variants: PrototypeVariant[]
}

const usePrototypeSwitcherStyles = makeStyles({ name: 'PrototypeSwitcher' })(
  (theme) => ({
    bar: {
      alignItems: 'center',
      background: theme.palette.warning.dark,
      borderRadius: 999,
      bottom: theme.spacing(2),
      boxShadow: theme.shadows[8],
      color: theme.palette.warning.contrastText,
      display: 'flex',
      gap: theme.spacing(1),
      left: '50%',
      maxWidth: 'calc(100vw - 32px)',
      padding: theme.spacing(0.5, 1),
      position: 'fixed',
      transform: 'translateX(-50%)',
      zIndex: theme.zIndex.tooltip,
    },
    details: { opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  })
)

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const PrototypeSwitcher: FC<PrototypeSwitcherProps> = ({
  current,
  details,
  onSelect,
  variants,
}) => {
  const { classes } = usePrototypeSwitcherStyles()
  const index = Math.max(
    variants.findIndex((variant) => variant.key === current),
    0
  )
  const selectOffset = (offset: number) =>
    onSelect(variants[(index + offset + variants.length) % variants.length].key)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      if (event.key === 'ArrowLeft') selectOffset(-1)
      if (event.key === 'ArrowRight') selectOffset(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (!import.meta.env.DEV) return null

  return (
    <Paper aria-label="Prototype variants" className={classes.bar} component="aside">
      <IconButton aria-label="Previous variant" color="inherit" onClick={() => selectOffset(-1)} size="small">
        <MdChevronLeft />
      </IconButton>
      <Typography aria-live="polite" variant="body2">
        <strong>{variants[index].key}</strong> {variants[index].name}
      </Typography>
      <IconButton aria-label="Next variant" color="inherit" onClick={() => selectOffset(1)} size="small">
        <MdChevronRight />
      </IconButton>
      {details && (
        <Typography className={classes.details} variant="caption">
          {details}
        </Typography>
      )}
    </Paper>
  )
}

export default PrototypeSwitcher
