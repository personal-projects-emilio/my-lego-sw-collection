import { useId } from 'react'

import { Drawer, type Theme, useMediaQuery } from '@mui/material'
import { useDrawerWidth } from 'hooks'

import ColumnChooser, { type ColumnChooserProps } from './ColumnChooser'
import useColumnChooserStyles from './ColumnChooser.styles'

type ColumnChooserDrawerProps<TData> = Omit<
  ColumnChooserProps<TData>,
  'titleId'
> & { id: string }

const ColumnChooserDrawer = <TData,>({
  id,
  ...chooserProps
}: ColumnChooserDrawerProps<TData>) => {
  const { classes } = useColumnChooserStyles()
  const titleId = useId()
  const isWide = useMediaQuery<Theme>((theme) => theme.breakpoints.up('md'))
  const { width, handleProps } = useDrawerWidth({
    storageKey: 'columnChooserWidth',
    defaultWidth: 320,
    minWidth: 240,
  })
  const content = (
    <>
      <div className={classes.resizeHandle} {...handleProps} />
      <ColumnChooser titleId={titleId} {...chooserProps} />
    </>
  )

  if (isWide)
    return (
      <aside
        aria-labelledby={titleId}
        className={classes.besideGrid}
        id={id}
        style={{ width }}
      >
        {content}
      </aside>
    )

  return (
    <Drawer
      anchor="right"
      onClose={chooserProps.onClose}
      open
      slotProps={{
        paper: {
          'aria-labelledby': titleId,
          className: classes.overlayPaper,
          id,
          style: { width },
        },
      }}
    >
      {content}
    </Drawer>
  )
}

export default ColumnChooserDrawer
