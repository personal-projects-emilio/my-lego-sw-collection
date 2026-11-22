import { useCallback } from 'react'

import type { GridApi } from 'ag-grid-community'
import { type ChooserColumn, isExcluded, toPinned } from 'utils/columnLayout'

import useGridValue from '../useGridValue'

const columnEvents = [
  'columnMoved',
  'columnVisible',
  'columnPinned',
  'displayedColumnsChanged',
  'newColumnsLoaded',
] as const

const useChooserColumns = <TData>(api: GridApi<TData>) =>
  useGridValue({
    api,
    eventTypes: columnEvents,
    read: useCallback(
      (): ChooserColumn[] =>
        api.getColumnState().flatMap(({ colId, hide, pinned }) => {
          const column = api.getColumn(colId)
          const colDef = column?.getColDef()
          if (colDef && isExcluded(colDef)) return []
          return {
            colId,
            headerName: column
              ? api.getDisplayNameForColumn(column, null)
              : colId,
            hide: !!hide,
            pinned: toPinned(pinned),
            isLockedVisible: !!colDef?.lockVisible,
            isLockedPosition: !!(
              colDef?.lockPosition || colDef?.suppressMovable
            ),
          }
        }),
      [api]
    ),
  })

export default useChooserColumns
