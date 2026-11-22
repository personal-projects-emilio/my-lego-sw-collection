import type { GridState } from 'ag-grid-community'

export type ColumnLayoutId =
  'sets' | 'minifigs' | 'looseMinifigs' | 'resaleSets'

export type ColumnLayout = Required<
  Pick<
    GridState,
    | 'columnOrder'
    | 'columnPinning'
    | 'columnSizing'
    | 'columnVisibility'
    | 'sort'
  >
>

export type SavedColumnLayout = {
  [Part in keyof ColumnLayout]?: Partial<ColumnLayout[Part]>
}

export type ColumnLayoutTarget = {
  userId: string
  columnLayoutId: ColumnLayoutId
}
