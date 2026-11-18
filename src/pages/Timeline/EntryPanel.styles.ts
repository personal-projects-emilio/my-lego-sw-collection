import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'EntryPanel' })((theme) => ({
  panel: {
    width: 340,
    maxWidth: '100vw',
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  muted: { color: theme.palette.text.secondary },
  warning: { color: theme.palette.error.main },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
  },
}))
