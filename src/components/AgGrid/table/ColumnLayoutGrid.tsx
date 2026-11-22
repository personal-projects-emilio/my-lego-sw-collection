import { useId, useMemo, useState } from 'react'
import { MdViewColumn } from 'react-icons/md'

import { Button, Skeleton } from '@mui/material'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import ConfirmDialog from 'components/ConfirmDialog'
import type { ColumnLayoutId } from 'types/columnLayout'
import type { GetTotalRow } from 'types/totalRow'
import {
  getColumnTotals,
  getTotalColumns,
  isTotalRow,
  totalRowId,
} from 'utils/totalRow'

import { ColumnChooserDrawer } from '../columnChooser'
import { ColumnHeader, suppressHeaderKeyboardEvent } from '../header'
import useAgGridTableStyles from './AgGridTable.styles'
import buildTotalRowColDefs, {
  buildTotalRowColDef,
} from './buildTotalRowColDefs'
import { ColumnLayoutContext } from './columnLayoutContext'
import useColumnLayout from './useColumnLayout'
import useTotalRow from './useTotalRow'

type ColumnLayoutGridProps<TData> = AgGridReactProps<TData> & {
  className: string
  columnLayoutId: ColumnLayoutId
  getTotalRow?: GetTotalRow<TData>
}

const ColumnLayoutGrid = <TData,>({
  className,
  columnLayoutId,
  defaultColDef,
  getRowId,
  getTotalRow,
  ...props
}: ColumnLayoutGridProps<TData>) => {
  const { classes } = useAgGridTableStyles()
  const chooserId = useId()
  const layout = useColumnLayout({
    columnLayoutId,
    columnDefs: props.columnDefs,
  })
  const totalColumns = useMemo(
    () => getTotalColumns(props.columnDefs),
    [props.columnDefs]
  )
  const getRowTotals: GetTotalRow<TData> | undefined =
    getTotalRow ??
    (totalColumns.length > 0
      ? (params) => getColumnTotals({ ...params, totalColumns })
      : undefined)
  const totalRow = useTotalRow({
    getTotalRow: getRowTotals,
    isTotalRowShown: layout.isTotalRowShown,
  })
  const [isChooserOpen, setIsChooserOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const { isTotalRowShown, toggleTotalRow } = layout
  const hasTotalRow = !!getRowTotals
  const actions = useMemo(
    () => ({
      openColumnChooser: () => setIsChooserOpen(true),
      requestReset: () => setIsResetOpen(true),
      ...(hasTotalRow && {
        totalRow: { isShown: isTotalRowShown, toggle: toggleTotalRow },
      }),
    }),
    [hasTotalRow, isTotalRowShown, toggleTotalRow]
  )
  const columnDefs = useMemo(
    () =>
      hasTotalRow ? buildTotalRowColDefs(layout.columnDefs) : layout.columnDefs,
    [hasTotalRow, layout.columnDefs]
  )
  const columnLayoutDefaultColDef = useMemo(() => {
    const gridDefaultColDef = {
      headerComponent: ColumnHeader,
      suppressHeaderKeyboardEvent,
      ...defaultColDef,
    }
    return hasTotalRow
      ? buildTotalRowColDef(gridDefaultColDef)
      : gridDefaultColDef
  }, [defaultColDef, hasTotalRow])
  const resetScope = `Column order, visibility, widths, pinning${hasTotalRow ? ', sorting and the total row' : ' and sorting'} go back to their defaults`

  if (layout.isLoading)
    return <Skeleton className={className} variant="rectangular" />

  return (
    <ColumnLayoutContext.Provider value={actions}>
      <div className={className}>
        <AgGridReact
          key={layout.gridKey}
          {...props}
          className={classes.grid}
          columnDefs={columnDefs}
          defaultColDef={columnLayoutDefaultColDef}
          getRowId={
            getRowId &&
            ((params) => (isTotalRow(params) ? totalRowId : getRowId(params)))
          }
          initialState={layout.initialState}
          onModelUpdated={(event) => {
            totalRow.onModelUpdated(event)
            props.onModelUpdated?.(event)
          }}
          pinnedBottomRowData={totalRow.pinnedBottomRowData}
          onGridReady={(event) => {
            layout.onGridReady(event)
            props.onGridReady?.(event)
          }}
          onStateUpdated={(event) => {
            layout.onStateUpdated(event)
            props.onStateUpdated?.(event)
          }}
        />
        {isChooserOpen && layout.api && (
          <ColumnChooserDrawer
            api={layout.api}
            id={chooserId}
            onClearSaveError={layout.clearSaveError}
            onClose={() => setIsChooserOpen(false)}
            onReset={actions.requestReset}
            saveError={layout.saveError}
          />
        )}
        <Button
          aria-controls={isChooserOpen ? chooserId : undefined}
          aria-expanded={isChooserOpen}
          className={classes.columnsTab}
          onClick={() => setIsChooserOpen((isOpen) => !isOpen)}
          size="small"
          startIcon={<MdViewColumn />}
        >
          Columns
        </Button>
      </div>
      <ConfirmDialog
        confirmLabel="Reset"
        isPending={layout.isResetting}
        message={
          layout.canSave
            ? `${resetScope}, and your saved layout for this table is deleted.`
            : `${resetScope}.`
        }
        onClose={() => setIsResetOpen(false)}
        onConfirm={async () => {
          await layout.reset()
          setIsResetOpen(false)
        }}
        open={isResetOpen}
        title="Reset the columns?"
      />
    </ColumnLayoutContext.Provider>
  )
}

export default ColumnLayoutGrid
