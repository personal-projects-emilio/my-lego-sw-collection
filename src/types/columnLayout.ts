import type { ColumnState } from 'ag-grid-community'

export type ColumnLayoutId =
  'sets' | 'minifigs' | 'looseMinifigs' | 'resaleSets'

export type ColumnLayout = {
  columnState: ColumnState[]
  showTotalRow: boolean
}

export type ColumnLayoutTarget = {
  userId: string
  columnLayoutId: ColumnLayoutId
}
