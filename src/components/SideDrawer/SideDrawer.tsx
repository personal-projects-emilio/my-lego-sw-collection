import { type FC, type PropsWithChildren, type ReactNode, useId } from 'react'
import { MdClose } from 'react-icons/md'

import { Drawer, IconButton, Typography } from '@mui/material'
import { useDrawerWidth } from 'hooks'

import useSideDrawerStyles from './SideDrawer.styles'

type SideDrawerProps = PropsWithChildren<{
  actions?: ReactNode
  defaultWidth: number
  id?: string
  isCloseDisabled?: boolean
  isOpen?: boolean
  minWidth: number
  onClose: () => void
  storageKey: string
  title: ReactNode
}>

const SideDrawer: FC<SideDrawerProps> = ({
  actions,
  children,
  defaultWidth,
  id,
  isCloseDisabled,
  isOpen = true,
  minWidth,
  onClose,
  storageKey,
  title,
}) => {
  const { classes } = useSideDrawerStyles()
  const titleId = useId()
  const { width, handleProps } = useDrawerWidth({
    storageKey,
    defaultWidth,
    minWidth,
  })
  const close = () => {
    if (!isCloseDisabled) onClose()
  }

  return (
    <Drawer
      anchor="right"
      className={classes.drawer}
      onClose={close}
      open={isOpen}
      slotProps={{
        paper: {
          'aria-labelledby': titleId,
          className: classes.paper,
          id,
          role: 'dialog',
          style: { width },
        },
      }}
    >
      <div className={classes.resizeHandle} {...handleProps} />
      <div className={classes.header}>
        <Typography
          className={classes.title}
          component="h2"
          id={titleId}
          variant="h6"
        >
          {title}
        </Typography>
        {actions}
        <IconButton
          aria-label="Close"
          disabled={isCloseDisabled}
          onClick={close}
        >
          <MdClose />
        </IconButton>
      </div>
      {children}
    </Drawer>
  )
}

export default SideDrawer
