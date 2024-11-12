import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
  container: {
    '--ag-cell-horizontal-padding': 'calc(var(--ag-grid-size) * 2)',
    boxSizing: 'border-box',
    height: 'calc(100vh - 48px)',
    maxHeight: 'calc(100vh - 48px)',
    overflow: 'hidden',
    padding: theme.spacing(1),
    width: '100%',
  },
}))

export default useStyles
