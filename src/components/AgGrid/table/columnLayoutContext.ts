import { createContext, useContext } from 'react'

type ColumnLayoutActions = {
  openColumnChooser: () => void
  requestReset: () => void
}

export const ColumnLayoutContext = createContext<
  ColumnLayoutActions | undefined
>(undefined)

export const useColumnLayoutActions = () => useContext(ColumnLayoutContext)
