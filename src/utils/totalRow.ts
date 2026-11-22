import type { ColDef, ColGroupDef, IRowNode } from 'ag-grid-community'
import set from 'lodash/set'
import sum from 'lodash/sum'
import type {
  ColumnTotal,
  TotalColumn,
  TotalRowData,
  TotalRowParams,
  TotalRowValue,
} from 'types/totalRow'

import { flattenColumnDefs, getColId, isExcluded } from './columnLayout'
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
}: TotalRowParams<TData> & {
  colId: string
  columnTotal: ColumnTotal<TData>
}): TotalRowValue => {
  if (columnTotal.aggregation === 'count') return formatFrNumber(rows.length)
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
  totalColumns,
  readCellValue,
}: TotalRowParams<TData> & {
  totalColumns: TotalColumn<TData>[]
}): TotalRowData =>
  totalColumns.reduce<TotalRowData>(
    (totalRow, { colId, total }) =>
      set(
        totalRow,
        colId,
        computeColumnTotal({ colId, columnTotal: total, rows, readCellValue })
      ),
    {}
  )

const hasColumnTotal = <TData>(
  columnDef: ColDef<TData>
): columnDef is ColDef<TData> & { context: { total: ColumnTotal<TData> } } =>
  !!columnDef.context?.total

export const getTotalColumns = <TData>(
  columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null
): TotalColumn<TData>[] =>
  flattenColumnDefs(columnDefs)
    .filter((colDef) => !isExcluded(colDef))
    .flatMap((colDef) => {
      const colId = getColId(colDef)
      return colId && hasColumnTotal(colDef)
        ? [{ colId, total: colDef.context.total }]
        : []
    })
