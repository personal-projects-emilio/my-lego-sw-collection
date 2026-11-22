export type TotalRowValue = number | string | null

export type TotalRowData = Record<string, TotalRowValue>

export type ReadCellValue<TData> = (params: {
  row: TData
  colId: string
}) => unknown

type ValueTotal<TData> = {
  getValue?: (row: TData) => unknown
  formatValue?: (total: number) => string
}

export type ColumnTotal<TData> =
  | { aggregation: 'count'; formatValue?: (total: number) => string }
  | (ValueTotal<TData> & { aggregation: 'sum' })
  | (ValueTotal<TData> & {
      aggregation: 'weightedAverage'
      getWeight: (row: TData) => number
    })

export type TotalColumns<TData> = Record<string, ColumnTotal<TData>>

export type GetTotalRow<TData> = (params: {
  rows: TData[]
  readCellValue: ReadCellValue<TData>
}) => TotalRowData
