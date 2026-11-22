import type { ColDef } from 'ag-grid-community'
import type { CollectionMinifig } from 'types/minifigs'
import type { TotalColumns } from 'types/totalRow'
import { formatFrNumber } from 'utils/format'

export const minifigsTotalColumns = {
  id: { aggregation: 'count' },
  owned: {
    aggregation: 'sum',
    getValue: ({ owned }) => owned.total,
    formatValue: formatFrNumber,
  },
} as const satisfies TotalColumns<CollectionMinifig>

const getLooseQuantity = ({ owned }: CollectionMinifig) => owned.loose.quantity

export const looseMinifigsTotalColumns = {
  id: { aggregation: 'count' },
  'owned.loose.quantity': { aggregation: 'sum' },
  'owned.loose.unitBoughtPrice': {
    aggregation: 'weightedAverage',
    getWeight: getLooseQuantity,
  },
  'owned.loose.unitMarketValue': {
    aggregation: 'weightedAverage',
    getWeight: getLooseQuantity,
  },
  totalBought: { aggregation: 'sum' },
  totalMarketValue: { aggregation: 'sum' },
} as const satisfies TotalColumns<CollectionMinifig>

export const defaultMinifigsColumnDefs = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<CollectionMinifig>
