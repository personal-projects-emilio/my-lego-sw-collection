import type { ColDef } from 'ag-grid-community'
import type { Set } from 'types/sets'

export const defaultSetsColumnDefs = {
  sortable: true,
  suppressHeaderContextMenu: false,
} as const satisfies ColDef<Set>
