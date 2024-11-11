import { type ColDef } from 'ag-grid-community'
import { Minifig } from 'types/minifigs'

export const defaultMinifigsColumnDefs = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<Minifig>
