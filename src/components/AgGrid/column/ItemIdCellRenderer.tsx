import type { ReactElement } from 'react'

import { Tooltip } from '@mui/material'
import type { CustomCellRendererProps } from 'ag-grid-react'
import Avatar from 'components/Avatar'
import { mapItemToImageProps } from 'constants/common'
import { makeStyles } from 'tss-react/mui'
import type { Item, ItemId } from 'types/common'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

const useStyles = makeStyles({ name: 'ItemIdCellRenderer' })({
  tooltip: {
    maxHeight: '50vh',
    padding: 0,
    lineHeight: 0,
  },
  image: {
    minHeight: 300,
  },
})

export type ItemIdCellRenderProps = {
  icon: ReactElement
  variant: Item
}

const ItemIdCellRenderer = ({
  value: id,
  icon,
  variant,
}: CustomCellRendererProps<unknown, ItemId> & ItemIdCellRenderProps) => {
  assert(isNotNullOrUndefined(id))
  const { classes } = useStyles()
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
        <Avatar aria-label={`Show ${alt}`}>{icon}</Avatar>
      </Tooltip>
      {id}
    </>
  )
}

export default ItemIdCellRenderer
