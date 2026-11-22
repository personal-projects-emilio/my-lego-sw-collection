import { makeStyles } from 'tss-react/mui'

import { gridColors } from './gridColors'

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
    border: `1px solid ${gridColors.border}`,
    borderRadius: theme.shape.borderRadius,
    boxSizing: 'border-box',
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
  },
  grid: {
    flex: 1,
    minWidth: 0,
  },
}))
