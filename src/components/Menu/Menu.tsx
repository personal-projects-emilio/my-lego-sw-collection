import type { FC } from 'react'

import { Menu as MuiMenu, type MenuProps as MuiMenuProps } from '@mui/material'

import useMenuStyles from './Menu.styles'
import type { MenuAnchor, MenuItemDefinition } from './menu.types'
import { renderMenuItems } from './renderMenuItems'

type MenuProps = Omit<
  MuiMenuProps,
  | 'anchorEl'
  | 'anchorPosition'
  | 'anchorReference'
  | 'children'
  | 'onClose'
  | 'open'
> & {
  items: MenuItemDefinition[]
  anchor?: MenuAnchor
  onClose: () => void
}

const Menu: FC<MenuProps> = ({ items, anchor, onClose, ...menuProps }) => {
  const { classes } = useMenuStyles()
  const isPosition = !!anchor && !(anchor instanceof HTMLElement)
  return (
    <MuiMenu
      anchorEl={isPosition ? undefined : anchor}
      anchorPosition={isPosition ? anchor : undefined}
      anchorReference={isPosition ? 'anchorPosition' : 'anchorEl'}
      onClose={onClose}
      open={!!anchor}
      slotProps={{ paper: { className: classes.paper } }}
      {...menuProps}
    >
      {renderMenuItems({ items, onClose })}
    </MuiMenu>
  )
}

export default Menu
