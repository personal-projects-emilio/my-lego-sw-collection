import { forwardRef } from 'react'

import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles({ name: 'AgGridTable' })((theme) => ({
  container: {
    '--ag-cell-horizontal-padding': 'calc(var(--ag-grid-size) * 2)',
    boxSizing: 'border-box',
    height: 'calc(100vh - 48px - 57px)',
    maxHeight: 'calc(100vh - 48px - 57px)',
    overflow: 'hidden',
    padding: theme.spacing(1),
    width: '100%',
  },
}))

const AgGridTable = forwardRef<AgGridReact, AgGridReactProps>((props, ref) => {
  const { classes, cx } = useStyles()
  return (
    <div className={cx('ag-theme-material-dark', classes.container)}>
      <AgGridReact ref={ref} {...props} />
    </div>
  )
})

export default AgGridTable
