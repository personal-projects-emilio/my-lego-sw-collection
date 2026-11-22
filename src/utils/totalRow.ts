import type { IRowNode } from 'ag-grid-community'
import sum from 'lodash/sum'
import type {
  ColumnTotal,
  ReadCellValue,
  TotalColumns,
  TotalRowData,
} from 'types/totalRow'

import { formatFrNumber } from './format'

export const isTotalRow = (node?: Pick<IRowNode, 'rowPinned'> | null) =>
  node?.rowPinned === 'bottom'

const toNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

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
}) => {
  if (columnTotal.aggregation === 'count') return rows.length
  const readValue = (row: TData) =>
    toNumber(
      columnTotal.getValue
        ? columnTotal.getValue(row)
        : readCellValue({ row, colId })
    )
  if (columnTotal.aggregation === 'sum')
    return sum(rows.map((row) => readValue(row) ?? 0))
  const weighted = rows.flatMap((row) => {
    const value = readValue(row)
    return value === null ? [] : [{ value, weight: columnTotal.getWeight(row) }]
  })
  const totalWeight = sum(weighted.map(({ weight }) => weight))
  return totalWeight > 0
    ? sum(weighted.map(({ value, weight }) => value * weight)) / totalWeight
    : null
}

export const getColumnTotals = <TData>({
  rows,
  totalColumns,
  readCellValue,
}: {
  rows: TData[]
  totalColumns: TotalColumns<TData>
  readCellValue: ReadCellValue<TData>
}): TotalRowData =>
  Object.fromEntries(
    Object.entries(totalColumns).map(([colId, columnTotal]) => {
      const total = computeColumnTotal({
        colId,
        columnTotal,
        rows,
        readCellValue,
      })
      const formatValue =
        columnTotal.formatValue ??
        (columnTotal.aggregation === 'count' ? formatFrNumber : undefined)
      return [colId, total !== null && formatValue ? formatValue(total) : total]
    })
  )
