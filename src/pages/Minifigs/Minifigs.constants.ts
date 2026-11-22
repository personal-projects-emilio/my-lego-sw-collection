import type { ColDef } from 'ag-grid-community'
import type { CollectionMinifig } from 'types/minifigs'

export const defaultMinifigsColumnDefs = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<CollectionMinifig>
