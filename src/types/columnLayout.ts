export type ColumnLayoutId =
  'sets' | 'minifigs' | 'looseMinifigs' | 'resaleSets'

export type SavedColumnState = {
  colId: string
  hide?: boolean
  width?: number
  flex?: number
  pinned?: 'left' | 'right'
  sort?: 'asc' | 'desc'
  sortIndex?: number
}

export type ColumnLayout = SavedColumnState[]
