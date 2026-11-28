import type { ColDef } from 'ag-grid-community'

export const buildActionsColDef = <TData>(
  colDef: ColDef<TData>
): ColDef<TData> => ({
  colId: 'actions',
  headerName: 'Actions',
  lockPinned: true,
  lockVisible: true,
  pinned: 'right',
  resizable: false,
  sortable: false,
  suppressMovable: true,
  ...colDef,
})
