import type { FC } from 'react'

import { Button } from '@mui/material'
import type { ColDef } from 'ag-grid-community'
import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import type { Set } from 'types/sets'
import { bricksetRowKey } from 'utils/brickset'

import { ignoreFields } from './ImportBricksetCsv.constants'
import ReportGrid from './ReportGrid'

type MissingRow = {
  key: string
  id: string
  name: string
  theme: string
  subtheme: string
  row: BricksetRow
}

type MissingSetsGridProps = {
  rows: BricksetRow[]
  newSetIds: Map<BricksetRow, Set['id']>
  addedKeys: string[]
  onToggleAdded: (keys: string[], isAdded: boolean) => void
  onIgnore: (key: keyof BricksetIgnoreList, value: string) => void
}

/** The CSV rows that match no set, each can be added or ignored. */
const MissingSetsGrid: FC<MissingSetsGridProps> = ({
  rows,
  newSetIds,
  addedKeys,
  onToggleAdded,
  onIgnore,
}) => {
  const rowData = rows.map((row): MissingRow => ({
    key: bricksetRowKey(row),
    id: String(newSetIds.get(row) ?? bricksetRowKey(row)),
    name: row.SetName,
    theme: row.Theme,
    subtheme: row.Subtheme,
    row,
  }))

  // Rebuilt on every render so the action cells follow addedKeys
  const columnDefs: ColDef<MissingRow>[] = [
    { field: 'id', headerName: 'Set', flex: 1, minWidth: 90 },
    { field: 'name', headerName: 'Name', flex: 2, minWidth: 140 },
    { field: 'theme', headerName: 'Theme', flex: 1, minWidth: 100 },
    { field: 'subtheme', headerName: 'Subtheme', flex: 1, minWidth: 100 },
    {
      colId: 'actions',
      headerName: '',
      filter: false,
      sortable: false,
      minWidth: 420,
      cellRenderer: ({ data }: { data?: MissingRow }) => {
        if (!data) return null
        const isAdded = addedKeys.includes(data.key)
        return (
          <>
            <Button
              size="small"
              variant={isAdded ? 'contained' : 'text'}
              onClick={() => onToggleAdded([data.key], isAdded)}
            >
              {isAdded ? 'Added' : 'Add'}
            </Button>
            {ignoreFields.map(
              ({ key, column, buttonLabel }) =>
                data.row[column] && (
                  <Button
                    key={key}
                    size="small"
                    title={data.row[column]}
                    onClick={() => onIgnore(key, data.row[column])}
                  >
                    {buttonLabel}
                  </Button>
                )
            )}
          </>
        )
      },
    },
  ]

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        sx={{ mb: 1 }}
        onClick={() => onToggleAdded(rows.map(bricksetRowKey), false)}
      >
        Add all
      </Button>
      <ReportGrid
        rowData={rowData}
        getRowId={({ data }) => data.key}
        columnDefs={columnDefs}
      />
    </>
  )
}

export default MissingSetsGrid
