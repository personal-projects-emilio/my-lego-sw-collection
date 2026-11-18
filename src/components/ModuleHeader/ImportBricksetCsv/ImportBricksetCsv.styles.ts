import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'ImportBricksetCsv' })((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  fileRow: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(2),
  },
  summary: {
    marginBottom: theme.spacing(1),
  },
}))
