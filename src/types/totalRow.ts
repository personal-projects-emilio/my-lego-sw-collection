import type { GridApi } from 'ag-grid-community'

export type TotalRowValue = number | string | null

export type TotalRowData = Record<string, unknown>

export type ReadCellValue<TData> = (params: {
  row: TData
  colId: string
}) => unknown

type ValueTotal<TData> = {
  getValue?: (row: TData) => unknown
  formatValue?: (total: number) => string
}

export type ColumnTotal<TData> =
  | { aggregation: 'count' }
  | (ValueTotal<TData> & { aggregation: 'sum' })
  | (ValueTotal<TData> & {
      aggregation: 'weightedAverage'
      getWeight: (row: TData) => number
    })

export type TotalColumn<TData> = { colId: string; total: ColumnTotal<TData> }

export type TotalRowParams<TData> = {
  rows: TData[]
  readCellValue: ReadCellValue<TData>
}

export type GetTotalRow<TData> = (params: TotalRowParams<TData>) => TotalRowData

export type TotalRowSwitch = {
  isShown: boolean
  toggle: (api: GridApi) => void
}
