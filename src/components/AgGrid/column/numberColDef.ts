import type { ColDef } from 'ag-grid-community'
import { formatFrNumber } from 'utils/format'

export const numberColDef = {
  cellDataType: 'number',
  filter: 'agNumberColumnFilter',
  suppressFloatingFilterButton: false,
  valueFormatter: ({ value }) =>
    typeof value === 'number' ? formatFrNumber(value) : '',
} as const satisfies ColDef
