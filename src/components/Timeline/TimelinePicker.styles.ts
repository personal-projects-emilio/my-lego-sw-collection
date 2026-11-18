import type { CSSObject } from 'tss-react'
import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'TimelinePicker' })((theme) => {
  const button: CSSObject = {
    font: 'inherit',
    color: 'inherit',
    background: 'transparent',
    textAlign: 'left',
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 1,
    },
    '&[aria-disabled="true"]': { cursor: 'default' },
  }
  const eraName: CSSObject = {
    display: 'inline-flex',
    flexDirection: 'column',
    margin: theme.spacing(0.5, 0, 0.5, 0.5),
    padding: theme.spacing(0.25, 1),
    borderRadius: 4,
    border: '1px solid transparent',
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    cursor: 'pointer',
    '&:hover:not([aria-disabled="true"])': {
      background: theme.palette.action.hover,
      boxShadow: 'inset 0 0 0 2px currentColor',
    },
  }
  const node: CSSObject = {
    ...button,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    fontSize: 13,
    lineHeight: '20px',
    padding: '1px 6px',
    margin: '1px 0',
    borderRadius: 4,
    border: '1px solid transparent',
    cursor: 'pointer',
    '& svg': { flexShrink: 0 },
    '&:hover:not([aria-disabled="true"])': {
      background: theme.palette.action.hover,
      boxShadow: 'inset 0 0 0 2px currentColor',
    },
  }
  return {
    eraName,
    eraButton: { ...button, ...eraName },
    node,
    groupNode: {
      ...node,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      rowGap: theme.spacing(2.5),
      alignItems: 'start',
    },
    era: { minWidth: 0 },
    eraLine: {
      position: 'relative',
      height: 16,
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        borderTop: '3px solid var(--era-color)',
      },
    },
    dot: {
      position: 'relative',
      zIndex: 1,
      width: 16,
      height: 16,
      marginLeft: theme.spacing(1),
      borderRadius: '50%',
      border: '3px solid var(--era-color)',
      background: theme.palette.background.paper,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 9,
      color: 'rgba(0, 0, 0, 0.87)',
    },
    eraRange: {
      fontSize: 11,
      fontWeight: 400,
      textTransform: 'none',
      letterSpacing: 0,
      opacity: 0.7,
    },
    branch: {
      listStyle: 'none',
      margin: theme.spacing(0, 1, 0, 2),
      padding: 0,
    },
    child: {
      paddingLeft: theme.spacing(1.5),
      position: 'relative',
      '&::before': {
        borderBottom: `1px solid ${theme.palette.text.disabled}`,
        content: '""',
        height: 13,
        left: 1,
        position: 'absolute',
        top: 0,
        width: `calc(${theme.spacing(1)} - 1px)`,
      },
      '&:last-child::before': {
        borderLeft: `1px solid ${theme.palette.text.disabled}`,
        left: 0,
        width: theme.spacing(1),
      },
      '&:not(:last-child)::after': {
        borderLeft: `1px solid ${theme.palette.text.disabled}`,
        bottom: 0,
        content: '""',
        left: 0,
        position: 'absolute',
        top: 0,
      },
    },
    eraLabel: { display: 'inline-flex', alignItems: 'center', gap: 4 },
  }
})
