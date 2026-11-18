import type { CSSObject } from 'tss-react'
import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'TimelineEraSections' })((theme) => {
  const button: CSSObject = {
    cursor: 'pointer',
    font: 'inherit',
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  }
  const headerPill: CSSObject = {
    border: 'none',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(0.75, 2.5),
    borderRadius: 999,
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    boxShadow: theme.shadows[2],
    transition: 'box-shadow 150ms',
  }
  const cell: CSSObject = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: theme.spacing(0.5, 0),
    justifyContent: 'center',
  }
  const card: CSSObject = {
    ...button,
    color: 'inherit',
    textAlign: 'left',
    position: 'relative',
    width: '100%',
    maxWidth: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    '& > svg': { flexShrink: 0, fontSize: 18, color: 'var(--era-color)' },
    '&:hover': {
      borderColor: 'var(--era-color)',
      boxShadow: '0 0 0 2px var(--era-color)',
    },
  }
  const cardConnector: CSSObject = {
    content: '""',
    position: 'absolute',
    width: theme.spacing(1),
    top: '50%',
    borderTop: '2px solid var(--era-color)',
  }
  const bracket: CSSObject = {
    ...button,
    color: 'inherit',
    background: 'transparent',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(0.5, 0),
    border: '2px solid var(--era-color)',
    '&:hover': {
      background: 'color-mix(in srgb, var(--era-color) 35%, transparent)',
    },
  }

  return {
    root: {
      maxWidth: 960,
      margin: '0 auto',
      padding: theme.spacing(3, 2, 12),
    },
    toolbar: {
      position: 'sticky',
      top: 0,
      zIndex: 2,
      display: 'flex',
      justifyContent: 'flex-end',
      padding: theme.spacing(1, 0),
      background: theme.palette.background.default,
    },
    section: {
      display: 'grid',
      gridTemplateColumns: '40px 1fr 96px 1fr 40px',
      columnGap: theme.spacing(1),
    },
    header: {
      gridColumn: '1 / -1',
      margin: 0,
      fontSize: 'inherit',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      padding: theme.spacing(1.5, 0),
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: 4,
        marginLeft: -2,
        background: 'var(--era-color)',
      },
    },
    headerPill,
    headerButton: {
      ...button,
      ...headerPill,
      '&:hover': {
        boxShadow: `0 0 0 3px ${theme.palette.text.primary}, ${theme.shadows[2]}`,
      },
    },
    headerRange: {
      fontSize: 11,
      fontWeight: 400,
      letterSpacing: 0.5,
      textTransform: 'none',
      opacity: 0.9,
    },
    axis: {
      gridColumn: 3,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: 4,
        marginLeft: -2,
        background: 'var(--era-color)',
      },
      '&[data-compressed]::before': {
        background:
          'repeating-linear-gradient(to bottom, var(--era-color) 0 6px, transparent 6px 12px)',
      },
    },
    year: {
      position: 'relative',
      zIndex: 1,
      fontSize: 11,
      fontWeight: 700,
      padding: theme.spacing(0.25, 1),
      borderRadius: 999,
      background: theme.palette.background.paper,
      border: '2px solid var(--era-color)',
      whiteSpace: 'nowrap',
    },
    leftCell: { ...cell, alignItems: 'flex-end' },
    rightCell: { ...cell, alignItems: 'flex-start' },
    leftCard: {
      ...card,
      flexDirection: 'row-reverse',
      textAlign: 'right',
      '&::after': {
        ...cardConnector,
        right: `calc(-1 * ${theme.spacing(1)})`,
      },
    },
    rightCard: {
      ...card,
      '&::after': {
        ...cardConnector,
        left: `calc(-1 * ${theme.spacing(1)})`,
      },
    },
    cardText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
    cardTitle: { fontWeight: 700, fontSize: 14, lineHeight: 1.2 },
    meta: { fontSize: 11, color: theme.palette.text.secondary },
    leftBracket: {
      ...bracket,
      borderRight: 'none',
      borderRadius: '8px 0 0 8px',
    },
    rightBracket: {
      ...bracket,
      borderLeft: 'none',
      borderRadius: '0 8px 8px 0',
    },
    bracketLabel: {
      writingMode: 'vertical-rl',
      transform: 'rotate(180deg)',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 1,
      whiteSpace: 'nowrap',
    },
  }
})
