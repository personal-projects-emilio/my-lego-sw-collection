import { createContext, useContext } from 'react'

type ColumnLayoutActions = {
  openColumnChooser: () => void
  requestReset: () => void
  isTotalRowShown?: boolean
  toggleTotalRow?: () => void
}

export const ColumnLayoutContext = createContext<
  ColumnLayoutActions | undefined
>(undefined)

export const useColumnLayoutActions = () => useContext(ColumnLayoutContext)
