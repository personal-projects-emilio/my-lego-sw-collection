import type { FC } from 'react'

import { Button, Table, TableBody, TableCell, TableRow } from '@mui/material'
import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import type { Set } from 'types/sets'
import { bricksetRowKey } from 'utils/brickset'

import { ignoreFields } from './ImportBricksetCsv.constants'

type MissingSetsTableProps = {
  rows: BricksetRow[]
  newSetIds: Map<BricksetRow, Set['id']>
  addedKeys: string[]
  onToggleAdded: (keys: string[], isAdded: boolean) => void
  onIgnore: (key: keyof BricksetIgnoreList, value: string) => void
}

/** The CSV rows that match no set, each can be added or ignored. */
const MissingSetsTable: FC<MissingSetsTableProps> = ({
  rows,
  newSetIds,
  addedKeys,
  onToggleAdded,
  onIgnore,
}) => (
  <>
    <Button
      size="small"
      variant="outlined"
      onClick={() => onToggleAdded(rows.map(bricksetRowKey), false)}
    >
      Add all
    </Button>
    <Table size="small">
      <TableBody>
        {rows.map((row) => {
          const key = bricksetRowKey(row)
          const isAdded = addedKeys.includes(key)
          return (
            <TableRow key={key}>
              <TableCell>
                {newSetIds.get(row)} {row.SetName}
              </TableCell>
              <TableCell>
                {row.Theme} / {row.Subtheme}
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant={isAdded ? 'contained' : 'text'}
                  onClick={() => onToggleAdded([key], isAdded)}
                >
                  {isAdded ? 'Added' : 'Add'}
                </Button>
                {ignoreFields.map(
                  ({ key: listKey, column, buttonLabel }) =>
                    row[column] && (
                      <Button
                        key={listKey}
                        size="small"
                        title={row[column]}
                        onClick={() => onIgnore(listKey, row[column])}
                      >
                        {buttonLabel}
                      </Button>
                    )
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  </>
)

export default MissingSetsTable
