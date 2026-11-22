import { useCallback } from 'react'

import type { Column, GridApi } from 'ag-grid-community'
import { countSorts } from 'utils/columnLayout'

import useGridValue from '../useGridValue'

const sortEvents = ['sortChanged'] as const

const useColumnSort = ({ api, column }: { api: GridApi; column: Column }) =>
  useGridValue({
    api,
    eventTypes: sortEvents,
    read: useCallback(() => {
      const direction = column.getSort() ?? undefined
      const isMultiSort = countSorts(api.getColumnState()) > 1
      const index = column.getSortIndex()
      return {
        direction,
        position:
          direction && isMultiSort && index != null ? index + 1 : undefined,
      }
    }, [api, column]),
  })

export default useColumnSort
