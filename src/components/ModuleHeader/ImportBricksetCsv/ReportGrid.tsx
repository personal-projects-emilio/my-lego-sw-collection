import type { ColDef } from 'ag-grid-community'
import type { AgGridReactProps } from 'ag-grid-react'
import { AgGridTable } from 'components/AgGrid/table'
import { makeStyles } from 'tss-react/mui'

const autoHeightMaxRows = 8

const defaultColDef = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef

const useStyles = makeStyles({ name: 'ReportGrid' })({
  grid: { height: 450, maxHeight: 450, padding: 0 },
  autoHeight: { height: 'auto', maxHeight: 'none', padding: 0 },
})

type ReportGridProps<TData> = AgGridReactProps<TData> & { rowData: TData[] }

/** The grid used by every import report section, short lists shrink to their rows. */
const ReportGrid = <TData,>({ rowData, ...props }: ReportGridProps<TData>) => {
  const { classes } = useStyles()
  const isShort = rowData.length <= autoHeightMaxRows
  return (
    <AgGridTable
      className={isShort ? classes.autoHeight : classes.grid}
      domLayout={isShort ? 'autoHeight' : 'normal'}
      defaultColDef={defaultColDef}
      rowData={rowData}
      {...props}
    />
  )
}

export default ReportGrid
