import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'AgGridTable' })((theme) => ({
  container: {
    boxSizing: 'border-box',
    height: 'calc(100vh - 48px - 57px)',
    maxHeight: 'calc(100vh - 48px - 57px)',
    overflow: 'hidden',
    padding: theme.spacing(1),
    width: '100%',
  },
  layout: {
    display: 'flex',
    height: '100%',
  },
  grid: {
    flex: 1,
    minWidth: 0,
  },
}))
