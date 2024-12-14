import { FaCheck } from 'react-icons/fa'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import type { CustomCellRendererProps } from 'ag-grid-react'
import Avatar from 'components/Avatar'
import { makeStyles } from 'tss-react/mui'
import type { Minifig } from 'types/minifigs'

const useStyles = makeStyles({ name: 'OwnedCellRenderer' })({
  tooltip: {
    maxHeight: '40vh',
    overflowX: 'auto',
    maxWidth: 'unset',
    width: '100%',
  },
})

const OwnedCellRenderer = ({
  value: owned,
}: CustomCellRendererProps<Minifig, Minifig['owned']>) => {
  const { classes } = useStyles()
  if (!owned) return null
  const { inSet, loose, total } = owned

  const avatar = <Avatar variant="rounded">{total}</Avatar>

  if (total === 0) return avatar

  return (
    <Tooltip
      classes={{
        tooltip: classes.tooltip,
      }}
      enterDelay={300}
      enterNextDelay={300}
      placement="left-start"
      title={
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Set Id</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>In frame</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inSet?.map(({ isInFrame, quantity, setId }) => (
                <TableRow key={`${setId}-${quantity}`}>
                  <TableCell>{setId}</TableCell>
                  <TableCell>{quantity}</TableCell>
                  <TableCell align="center">
                    {isInFrame && <FaCheck />}
                  </TableCell>
                </TableRow>
              ))}
              {loose.quantity > 0 && (
                <TableRow>
                  <TableCell>Loose</TableCell>
                  <TableCell>{loose.quantity}</TableCell>
                  <TableCell align="center">
                    {loose.isInFrame && <FaCheck />}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      }
    >
      {avatar}
    </Tooltip>
  )
}

export default OwnedCellRenderer
