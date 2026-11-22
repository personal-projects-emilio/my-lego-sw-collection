import type { ColDef } from 'ag-grid-community'
import sumBy from 'lodash/sumBy'
import type { CollectionSet, Set } from 'types/sets'
import type { TotalColumns } from 'types/totalRow'
import { formatFrNumber } from 'utils/format'

export const setsTotalColumns = {
  id: { aggregation: 'count' },
  'content.partsQuantity': { aggregation: 'sum' },
  'content.minifigs': {
    aggregation: 'sum',
    getValue: ({ content }) => sumBy(content.minifigs ?? [], 'quantity'),
    formatValue: formatFrNumber,
  },
  'prices.bought': { aggregation: 'sum' },
  'prices.marketValue': { aggregation: 'sum' },
  'prices.storeValue': { aggregation: 'sum' },
  ownedQuantity: { aggregation: 'sum' },
} as const satisfies TotalColumns<CollectionSet>

export const defaultSetsColumnDefs = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressHeaderContextMenu: false,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<Set>
