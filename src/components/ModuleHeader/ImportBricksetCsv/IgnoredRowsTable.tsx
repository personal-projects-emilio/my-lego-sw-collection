import type { FC } from 'react'

import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import type { BricksetReport } from 'utils/brickset'

type IgnoredRowsTableProps = {
  ignored: BricksetReport['ignored']
}

const IgnoredRowsTable: FC<IgnoredRowsTableProps> = ({ ignored }) => (
  <Table size="small">
    <TableBody>
      {ignored.map(({ row, reason }, index) => (
        <TableRow key={index}>
          <TableCell>
            {row.Number}-{row.Variant} {row.SetName}
          </TableCell>
          <TableCell>Ignored by {reason}</TableCell>
          <TableCell>
            {row.Theme} / {row.Subtheme}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default IgnoredRowsTable
