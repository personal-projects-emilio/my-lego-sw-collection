import { createContext, useContext } from 'react'

import type { TotalRowSwitch } from 'types/totalRow'

type ColumnLayoutActions = {
  openColumnChooser: () => void
  requestReset: () => void
  totalRow?: TotalRowSwitch
}

export const ColumnLayoutContext = createContext<
  ColumnLayoutActions | undefined
>(undefined)

export const useColumnLayoutActions = () => useContext(ColumnLayoutContext)
