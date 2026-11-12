import { type FC, useMemo } from 'react'

import type { ColDef, GridApi, RowSelectionOptions } from 'ag-grid-community'
import { AgGridTable } from 'components/AgGrid/table'
import { makeStyles } from 'tss-react/mui'
import {
  type BricksetReport,
  changeKey,
  type FieldChange,
} from 'utils/brickset'

type UpdateRow = {
  key: string
  id: string
  name: string
  field: string
  from: FieldChange['from']
  to: FieldChange['to']
  change: number | null
}

const formatValue = (value: unknown) =>
  value === null || value === undefined || value === '' ? '—' : String(value)

const defaultColDef = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<UpdateRow>

const columnDefs: ColDef<UpdateRow>[] = [
  { field: 'id', headerName: 'Set', flex: 1, minWidth: 80 },
  { field: 'name', headerName: 'Name', flex: 2, minWidth: 120 },
  { field: 'field', headerName: 'Field', flex: 2, minWidth: 160 },
  {
    field: 'from',
    headerName: 'Current',
    cellDataType: false,
    valueFormatter: ({ value }) => formatValue(value),
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'to',
    headerName: 'New',
    cellDataType: false,
    valueFormatter: ({ value }) => formatValue(value),
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'change',
    headerName: 'Change',
    filter: 'agNumberColumnFilter',
    valueFormatter: ({ value }) =>
      value === null || value === undefined
        ? ''
        : (value > 0 ? '+' : '') + Number(value.toFixed(2)),
    flex: 1,
    minWidth: 80,
  },
]

const rowSelection: RowSelectionOptions<UpdateRow> = {
  mode: 'multiRow',
  selectAll: 'filtered',
}

const useStyles = makeStyles({ name: 'UpdatesGrid' })({
  grid: { height: 450, maxHeight: 450, padding: 0 },
})

type UpdatesGridProps = {
  updates: BricksetReport['updates']
  skippedKeys: string[]
  onSkippedKeysChange: (keys: string[]) => void
}

/** One row per field change, unchecked rows are skipped. */
const UpdatesGrid: FC<UpdatesGridProps> = ({
  updates,
  skippedKeys,
  onSkippedKeysChange,
}) => {
  const { classes } = useStyles()

  const rowData = useMemo(
    () =>
      updates.flatMap(({ set, changes }) =>
        changes.map(({ field, from, to }): UpdateRow => ({
          key: changeKey(set.id, field),
          id: String(set.id),
          name: set.name,
          field,
          from,
          to,
          change:
            typeof from === 'number' && typeof to === 'number'
              ? to - from
              : null,
        }))
      ),
    [updates]
  )

  const selectNotSkipped = (api: GridApi<UpdateRow>) => {
    const nodes: Parameters<typeof api.setNodesSelected>[0]['nodes'] = []
    api.forEachNode((node) => {
      if (node.data && !skippedKeys.includes(node.data.key)) nodes.push(node)
    })
    api.setNodesSelected({ nodes, newValue: true })
  }

  const onSelectionChanged = (api: GridApi<UpdateRow>) => {
    const keys: string[] = []
    api.forEachNode((node) => {
      if (node.data && !node.isSelected()) keys.push(node.data.key)
    })
    onSkippedKeysChange(keys)
  }

  return (
    <AgGridTable
      className={classes.grid}
      rowData={rowData}
      getRowId={({ data }) => data.key}
      rowSelection={rowSelection}
      onFirstDataRendered={({ api }) => selectNotSkipped(api)}
      onRowDataUpdated={({ api }) => selectNotSkipped(api)}
      onSelectionChanged={({ api }) => onSelectionChanged(api)}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
    />
  )
}

export default UpdatesGrid
