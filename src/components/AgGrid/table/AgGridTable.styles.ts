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
    height: `calc(100vh - 48px - 57px - ${theme.spacing(2)})`,
    margin: theme.spacing(1),
    overflow: 'hidden',
  },
  grid: {
    flex: 1,
    minWidth: 0,
  },
  columnsTab: {
    alignSelf: 'stretch',
    backgroundColor: gridColors.chrome,
    borderLeft: `1px solid ${gridColors.border}`,
    borderRadius: 0,
    justifyContent: 'flex-start',
    flexShrink: 0,
    minWidth: 0,
    padding: theme.spacing(1, 0.5),
    writingMode: 'vertical-rl',
    '& .MuiButton-startIcon': {
      margin: theme.spacing(0, 0, 1, 0),
    },
  },
}))
