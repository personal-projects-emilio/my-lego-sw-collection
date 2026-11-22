import type { IRowNode } from 'ag-grid-community'
import set from 'lodash/set'
import sum from 'lodash/sum'
import type {
  ColumnTotal,
  MapColIdsToTotals,
  ReadCellValue,
  TotalRowData,
  TotalRowValue,
} from 'types/totalRow'

import { formatFrNumber } from './format'

export const totalRowId = 'total'

export const isTotalRow = (
  node?: Partial<Pick<IRowNode, 'rowPinned'>> | null
) => node?.rowPinned === 'bottom'

const toNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const formatTotal = ({
  total,
  formatValue,
}: {
  total: number | null
  formatValue?: (total: number) => string
}): TotalRowValue =>
  total !== null && formatValue ? formatValue(total) : total

const computeColumnTotal = <TData>({
  colId,
  columnTotal,
  rows,
  readCellValue,
}: {
  colId: string
  columnTotal: ColumnTotal<TData>
  rows: TData[]
  readCellValue: ReadCellValue<TData>
}): TotalRowValue => {
  if (columnTotal.aggregation === 'count')
    return formatTotal({
      total: rows.length,
      formatValue: columnTotal.formatValue ?? formatFrNumber,
    })
  const readValue = (row: TData) =>
    toNumber(
      columnTotal.getValue
        ? columnTotal.getValue(row)
        : readCellValue({ row, colId })
    )
  if (columnTotal.aggregation === 'sum')
    return formatTotal({
      total: sum(rows.map((row) => readValue(row) ?? 0)),
      formatValue: columnTotal.formatValue,
    })
  const weighted = rows.flatMap((row) => {
    const value = readValue(row)
    return value === null ? [] : [{ value, weight: columnTotal.getWeight(row) }]
  })
  const totalWeight = sum(weighted.map(({ weight }) => weight))
  return formatTotal({
    total:
      totalWeight > 0
        ? sum(weighted.map(({ value, weight }) => value * weight)) / totalWeight
        : null,
    formatValue: columnTotal.formatValue,
  })
}

export const getColumnTotals = <TData>({
  rows,
  mapColIdsToTotals,
  readCellValue,
}: {
  rows: TData[]
  mapColIdsToTotals: MapColIdsToTotals<TData>
  readCellValue: ReadCellValue<TData>
}): TotalRowData =>
  Object.entries(mapColIdsToTotals).reduce<TotalRowData>(
    (totalRow, [colId, columnTotal]) =>
      set(
        totalRow,
        colId,
        computeColumnTotal({ colId, columnTotal, rows, readCellValue })
      ),
    {}
  )
