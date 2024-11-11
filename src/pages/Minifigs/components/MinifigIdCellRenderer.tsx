import { FaPerson } from 'react-icons/fa6'

import { Avatar, Tooltip } from '@mui/material'
import { type CustomCellRendererProps } from 'ag-grid-react'
import { makeStyles } from 'tss-react/mui'
import { Minifig } from 'types/minifigs'

const useStyles = makeStyles()((theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.dark,
    height: 24,
    width: 24,
    fontSize: theme.typography.button.fontSize,
  },
  tooltip: {
    maxHeight: '50vh',
    padding: 0,
    lineHeight: 0,
  },
  image: {
    minHeight: 300,
  },
}))

const MinifigIdCellRenderer = ({
  value: minifigId,
}: CustomCellRendererProps<Minifig, Minifig['id']>) => {
  const { classes } = useStyles()
  if (!minifigId) return null

  return (
    <>
      <Tooltip
        classes={{
          tooltip: classes.tooltip,
        }}
        enterDelay={300}
        enterNextDelay={300}
        placement="right-start"
        title={
          <img
            alt={`${minifigId} bricklink picture`}
            className={classes.image}
            src={`https://img.bricklink.com/ItemImage/MN/0/${minifigId}.png`}
          />
        }
      >
        <Avatar
          aria-label={`Show ${minifigId} bricklink picture`}
          className={classes.avatar}
        >
          <FaPerson />
        </Avatar>
      </Tooltip>
      {minifigId}
    </>
  )
}

export default MinifigIdCellRenderer
