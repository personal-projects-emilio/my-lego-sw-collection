import { createContext, useContext } from 'react'

type ColumnFilterActions = {
  isColumnFilterable: (columnId: string) => boolean
  isColumnFiltered: (columnId: string) => boolean
  openColumnFilter: (columnId: string) => void
}

export const ColumnFilterContext = createContext<
  ColumnFilterActions | undefined
>(undefined)

export const useColumnFilterActions = () => useContext(ColumnFilterContext)
