import type {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community'
import get from 'lodash/get'
import { getColId, mapColumnDefs } from 'utils/columnLayout'
import { isTotalRow } from 'utils/totalRow'

import { OverflowTypographyCellRenderer } from '../column'

export const buildTotalRowColDef = <TData>(
  colDef: ColDef<TData>
): ColDef<TData> => {
  const colId = getColId(colDef)
  const {
    cellClass,
    cellRendererSelector,
    editable,
    field,
    valueFormatter,
    valueGetter,
  } = colDef

  return {
    ...colDef,
    ...(cellClass !== undefined && {
      cellClass: (params) => {
        if (isTotalRow(params.node)) return undefined
        return typeof cellClass === 'function' ? cellClass(params) : cellClass
      },
    }),
    cellRendererSelector: (params) =>
      isTotalRow(params.node)
        ? { component: OverflowTypographyCellRenderer }
        : cellRendererSelector?.(params),
    valueGetter: (params: ValueGetterParams<TData>) => {
      if (isTotalRow(params.node))
        return colId ? (get(params.data, colId) ?? null) : null
      if (typeof valueGetter === 'function') return valueGetter(params)
      return field ? get(params.data, field) : undefined
    },
    ...(typeof valueFormatter === 'function' && {
      valueFormatter: (params: ValueFormatterParams<TData>) => {
        if (!isTotalRow(params.node)) return valueFormatter(params)
        if (params.value === null || params.value === undefined) return ''
        return typeof params.value === 'string'
          ? params.value
          : valueFormatter(params)
      },
    }),
    ...(editable !== undefined && {
      editable: (params) =>
        !isTotalRow(params.node) &&
        (typeof editable === 'function' ? editable(params) : editable),
    }),
  }
}

const buildTotalRowColDefs = <TData>(
  columnDefs: GridOptions<TData>['columnDefs']
) => mapColumnDefs({ columnDefs, mapColDef: buildTotalRowColDef })

export default buildTotalRowColDefs
