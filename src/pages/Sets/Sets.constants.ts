import type { ColDef } from 'ag-grid-community'
import type { Set } from 'types/sets'

export const defaultSetsColumnDefs = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressHeaderContextMenu: false,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<Set>
