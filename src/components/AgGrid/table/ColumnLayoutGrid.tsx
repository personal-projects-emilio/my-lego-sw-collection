import { useId, useMemo, useState } from 'react'
import { MdViewColumn } from 'react-icons/md'

import { Button, Skeleton } from '@mui/material'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import ConfirmDialog from 'components/ConfirmDialog'
import type { ColumnLayoutId } from 'types/columnLayout'

import { ColumnChooserDrawer } from '../columnChooser'
import { ColumnHeader, suppressHeaderKeyboardEvent } from '../header'
import useAgGridTableStyles from './AgGridTable.styles'
import { ColumnLayoutContext } from './columnLayoutContext'
import useColumnLayout from './useColumnLayout'

type ColumnLayoutGridProps<TData> = AgGridReactProps<TData> & {
  className: string
  columnLayoutId: ColumnLayoutId
}

const ColumnLayoutGrid = <TData,>({
  className,
  columnLayoutId,
  defaultColDef,
  ...props
}: ColumnLayoutGridProps<TData>) => {
  const { classes } = useAgGridTableStyles()
  const chooserId = useId()
  const layout = useColumnLayout({
    columnLayoutId,
    columnDefs: props.columnDefs,
  })
  const [isChooserOpen, setIsChooserOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const actions = useMemo(
    () => ({
      openColumnChooser: () => setIsChooserOpen(true),
      requestReset: () => setIsResetOpen(true),
    }),
    []
  )
  const columnLayoutDefaultColDef = useMemo(
    () => ({
      headerComponent: ColumnHeader,
      suppressHeaderKeyboardEvent,
      ...defaultColDef,
    }),
    [defaultColDef]
  )

  if (layout.isLoading)
    return <Skeleton className={className} variant="rectangular" />

  return (
    <ColumnLayoutContext.Provider value={actions}>
      <div className={className}>
        <div className={classes.layout}>
          <div className={classes.grid}>
            <AgGridReact
              key={layout.gridKey}
              {...props}
              columnDefs={layout.columnDefs}
              defaultColDef={columnLayoutDefaultColDef}
              initialState={layout.initialState}
              onGridReady={(event) => {
                layout.onGridReady(event)
                props.onGridReady?.(event)
              }}
              onStateUpdated={(event) => {
                layout.onStateUpdated(event)
                props.onStateUpdated?.(event)
              }}
            />
          </div>
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
      </div>
      <ConfirmDialog
        confirmLabel="Reset"
        isPending={layout.isResetting}
        message="Column order, visibility, widths, pinning and sorting go back to their defaults, and your saved layout for this table is deleted."
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
