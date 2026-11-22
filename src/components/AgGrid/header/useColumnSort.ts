import { useEffect, useState } from 'react'

import type { Column, GridApi } from 'ag-grid-community'
import { countSorts } from 'utils/columnLayout'

const readSort = ({ api, column }: { api: GridApi; column: Column }) => {
  const direction = column.getSort() ?? undefined
  const isMultiSort = countSorts(api.getColumnState()) > 1
  const index = column.getSortIndex()
  return {
    direction,
    position: direction && isMultiSort && index != null ? index + 1 : undefined,
  }
}

const useColumnSort = ({ api, column }: { api: GridApi; column: Column }) => {
  const [sort, setSort] = useState(() => readSort({ api, column }))

  useEffect(() => {
    const update = () => setSort(readSort({ api, column }))
    api.addEventListener('sortChanged', update)
    return () => {
      if (!api.isDestroyed()) api.removeEventListener('sortChanged', update)
    }
  }, [api, column])

  return sort
}

export default useColumnSort
