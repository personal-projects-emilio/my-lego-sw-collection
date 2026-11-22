import type { ColDef } from 'ag-grid-community'
import type { CollectionMinifig } from 'types/minifigs'
import type { MapColIdsToTotals } from 'types/totalRow'
import { formatFrNumber } from 'utils/format'

export const mapMinifigColIdsToTotals = {
  id: { aggregation: 'count' },
  owned: {
    aggregation: 'sum',
    getValue: ({ owned }) => owned.total,
    formatValue: formatFrNumber,
  },
} as const satisfies MapColIdsToTotals<CollectionMinifig>

const getLooseQuantity = ({ owned }: CollectionMinifig) => owned.loose.quantity

export const mapLooseMinifigColIdsToTotals = {
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
} as const satisfies MapColIdsToTotals<CollectionMinifig>

export const defaultMinifigsColumnDefs = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<CollectionMinifig>
