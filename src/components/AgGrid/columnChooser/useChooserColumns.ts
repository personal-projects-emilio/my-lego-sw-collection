import { useEffect, useState } from 'react'

import type { GridApi } from 'ag-grid-community'
import { type ChooserColumn, toPinned } from 'utils/columnLayout'

const columnEvents = [
  'columnMoved',
  'columnVisible',
  'columnPinned',
  'displayedColumnsChanged',
  'newColumnsLoaded',
] as const

const readColumns = <TData>({
  api,
  excludedColIds,
}: {
  api: GridApi<TData>
  excludedColIds: string[]
}): ChooserColumn[] =>
  api.getColumnState().map(({ colId, hide, pinned }) => {
    const column = api.getColumn(colId)
    const colDef = column?.getColDef()
    return {
      colId,
      headerName: column ? api.getDisplayNameForColumn(column, null) : colId,
      hide: !!hide,
      pinned: toPinned(pinned),
      isExcluded: excludedColIds.includes(colId),
      isLockedVisible: !!colDef?.lockVisible,
      isLockedPosition: !!(colDef?.lockPosition || colDef?.suppressMovable),
    }
  })

const useChooserColumns = <TData>({
  api,
  excludedColIds,
}: {
  api: GridApi<TData>
  excludedColIds: string[]
}) => {
  const [columns, setColumns] = useState(() =>
    readColumns({ api, excludedColIds })
  )

  useEffect(() => {
    const update = () => setColumns(readColumns({ api, excludedColIds }))
    update()
    columnEvents.forEach((type) => api.addEventListener(type, update))
    return () => {
      if (!api.isDestroyed())
        columnEvents.forEach((type) => api.removeEventListener(type, update))
    }
  }, [api, excludedColIds])

  return columns
}

export default useChooserColumns
