import type { FC } from 'react'

import type { ColDef } from 'ag-grid-community'
import type { Set } from 'types/sets'
import { compareIds } from 'utils/array'

import ReportGrid from './ReportGrid'

const columnDefs: ColDef<Set>[] = [
  {
    field: 'id',
    headerName: 'Set',
    cellDataType: 'text',
    comparator: compareIds,
    flex: 1,
    minWidth: 90,
  },
  { field: 'name', headerName: 'Name', flex: 2, minWidth: 140 },
  { field: 'subtheme', headerName: 'Subtheme', flex: 1, minWidth: 100 },
]

/** Sets of the collection that a report section lists without changing them. */
const SetsGrid: FC<{ sets: Set[] }> = ({ sets }) => (
  <ReportGrid
    rowData={sets}
    getRowId={({ data }) => String(data.id)}
    columnDefs={columnDefs}
  />
)

export default SetsGrid
