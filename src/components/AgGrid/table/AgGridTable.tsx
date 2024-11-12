import { forwardRef } from 'react'

import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'

import useStyles from './AgGridTable.styles'

const AgGridTable = forwardRef<AgGridReact, AgGridReactProps>((props, ref) => {
  const { classes, cx } = useStyles()
  return (
    <div className={cx('ag-theme-material-dark', classes.container)}>
      <AgGridReact ref={ref} {...props} />
    </div>
  )
})

export default AgGridTable
