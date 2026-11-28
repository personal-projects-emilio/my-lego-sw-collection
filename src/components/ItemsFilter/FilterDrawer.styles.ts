import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'FilterDrawer' })((theme) => ({
  body: { overflowX: 'hidden', overflowY: 'auto' },
  accordion: {
    background: 'transparent',
    borderTop: `1px solid ${theme.palette.divider}`,
    '&::before': { display: 'none' },
  },
  group: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  notApplied: {
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(0.5),
    pointerEvents: 'auto',
    verticalAlign: 'text-bottom',
  },
}))
