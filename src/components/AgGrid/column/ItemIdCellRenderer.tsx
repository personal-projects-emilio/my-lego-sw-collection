import type { ReactElement } from 'react'

import { Avatar, Tooltip } from '@mui/material'
import type { CustomCellRendererProps } from 'ag-grid-react'
import { mapItemToImageProps } from 'constants/common'
import { makeStyles } from 'tss-react/mui'
import type { Item, ItemId } from 'types/common'

const useStyles = makeStyles({ name: 'ItemIdCellRenderer' })((theme) => ({
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

export type ItemIdCellRenderParams = {
  icon: ReactElement
  variant: Item
}

const ItemIdCellRenderer = ({
  value: id,
  icon,
  variant,
}: CustomCellRendererProps<unknown, ItemId> & ItemIdCellRenderParams) => {
  const { classes } = useStyles()
  if (!id) return null
  const { alt, src } = mapItemToImageProps[variant](String(id))

  return (
    <>
      <Tooltip
        classes={{
          tooltip: classes.tooltip,
        }}
        enterDelay={300}
        enterNextDelay={300}
        placement="right-start"
        title={<img alt={alt} className={classes.image} src={src} />}
      >
        <Avatar aria-label={`Show ${alt}`} className={classes.avatar}>
          {icon}
        </Avatar>
      </Tooltip>
      {id}
    </>
  )
}

export default ItemIdCellRenderer
