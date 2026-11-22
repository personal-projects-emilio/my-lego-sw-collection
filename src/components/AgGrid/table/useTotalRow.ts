import { useMemo, useState } from 'react'

import type { IRowNode, ModelUpdatedEvent } from 'ag-grid-community'
import isEqual from 'lodash/isEqual'
import type { GetTotalRow, TotalRowData } from 'types/totalRow'

const useTotalRow = <TData>({
  getTotalRow,
  isTotalRowShown,
}: {
  getTotalRow?: GetTotalRow<TData>
  isTotalRowShown: boolean
}) => {
  const [totalRow, setTotalRow] = useState<TotalRowData>()

  const onModelUpdated = ({ api }: ModelUpdatedEvent<TData>) => {
    if (!getTotalRow) return
    const mapRowsToNodes = new Map<TData, IRowNode<TData>>()
    api.forEachNodeAfterFilter((node) => {
      if (node.data) mapRowsToNodes.set(node.data, node)
    })
    const next = getTotalRow({
      rows: [...mapRowsToNodes.keys()],
      readCellValue: ({ row, colId }) => {
        const rowNode = mapRowsToNodes.get(row)
        return rowNode && api.getCellValue({ rowNode, colKey: colId })
      },
    })
    setTotalRow((previous) => (isEqual(previous, next) ? previous : next))
  }

  const pinnedBottomRowData = useMemo(
    () => (isTotalRowShown && totalRow ? [totalRow] : undefined),
    [isTotalRowShown, totalRow]
  )

  return { onModelUpdated, pinnedBottomRowData }
}

export default useTotalRow
