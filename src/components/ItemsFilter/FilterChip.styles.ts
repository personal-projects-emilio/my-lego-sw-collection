import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'FilterChip' })((theme) => ({
  chip: {
    alignItems: 'center',
    background: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.primary.contrastText,
    display: 'inline-flex',
    height: 40,
    maxWidth: 260,
    '&[data-enabled="false"]': {
      background: 'transparent',
      borderColor: theme.palette.divider,
      color: theme.palette.text.secondary,
    },
  },
  main: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    minWidth: 0,
    padding: theme.spacing(0, 0.5),
  },
  category: { lineHeight: 1.1, opacity: 0.8 },
  value: {
    lineHeight: 1.2,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '[data-enabled="false"] &': { textDecoration: 'line-through' },
  },
  iconButton: { color: 'inherit' },
}))
