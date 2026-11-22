import { useMemo, useState } from 'react'

import type { IRowNode, ModelUpdatedEvent } from 'ag-grid-community'
import isEqual from 'lodash/isEqual'
import type { GetTotalRow, TotalRowData } from 'types/totalRow'

const useTotalRow = <TData>({
  getTotalRow,
  isShown,
}: {
  getTotalRow?: GetTotalRow<TData>
  isShown: boolean
}) => {
  const [totalRow, setTotalRow] = useState<TotalRowData>()

  const onModelUpdated = ({ api }: ModelUpdatedEvent<TData>) => {
    if (!getTotalRow) return
    const nodesByRow = new Map<TData, IRowNode<TData>>()
    api.forEachNodeAfterFilter((node) => {
      if (node.data) nodesByRow.set(node.data, node)
    })
    const next = getTotalRow({
      rows: [...nodesByRow.keys()],
      readCellValue: ({ row, colId }) => {
        const rowNode = nodesByRow.get(row)
        return rowNode && api.getCellValue({ rowNode, colKey: colId })
      },
    })
    setTotalRow((previous) => (isEqual(previous, next) ? previous : next))
  }

  const pinnedBottomRowData = useMemo(
    () => (isShown && totalRow ? [totalRow] : undefined),
    [isShown, totalRow]
  )

  return { onModelUpdated, pinnedBottomRowData }
}

export default useTotalRow
