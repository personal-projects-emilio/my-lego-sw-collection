import type { ColDef } from 'ag-grid-community'
import type { CollectionMinifig } from 'types/minifigs'

export const defaultMinifigsColumnDefs = {
  sortable: true,
} as const satisfies ColDef<CollectionMinifig>
