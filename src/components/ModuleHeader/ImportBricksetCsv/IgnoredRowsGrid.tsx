import type { FC } from 'react'

import type { ColDef } from 'ag-grid-community'
import type { BricksetReport, IgnoreReason } from 'utils/brickset'

import ReportGrid from './ReportGrid'

type IgnoredRow = {
  set: string
  name: string
  reason: IgnoreReason
  theme: string
  subtheme: string
}

const columnDefs: ColDef<IgnoredRow>[] = [
  { field: 'set', headerName: 'Set', flex: 1, minWidth: 90 },
  { field: 'name', headerName: 'Name', flex: 2, minWidth: 140 },
  { field: 'reason', headerName: 'Ignored by', flex: 1, minWidth: 100 },
  { field: 'theme', headerName: 'Theme', flex: 1, minWidth: 100 },
  { field: 'subtheme', headerName: 'Subtheme', flex: 1, minWidth: 100 },
]

type IgnoredRowsGridProps = {
  ignored: BricksetReport['ignored']
}

const IgnoredRowsGrid: FC<IgnoredRowsGridProps> = ({ ignored }) => (
  <ReportGrid
    rowData={ignored.map(({ row, reason }): IgnoredRow => ({
      set: `${row.Number}-${row.Variant}`,
      name: row.SetName,
      reason,
      theme: row.Theme,
      subtheme: row.Subtheme,
    }))}
    columnDefs={columnDefs}
  />
)

export default IgnoredRowsGrid
