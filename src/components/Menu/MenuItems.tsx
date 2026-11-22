import type { FC, ReactNode } from 'react'
import { MdCheck } from 'react-icons/md'

import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  type MenuItemProps,
  Switch,
} from '@mui/material'
import { Link } from '@tanstack/react-router'

import useMenuStyles from './Menu.styles'
import type { ActionItem, LinkItem, RadioItem, SwitchItem } from './menu.types'

export type InjectedMenuItemProps = Pick<
  MenuItemProps,
  'autoFocus' | 'tabIndex'
>

type ItemProps<Item> = InjectedMenuItemProps & {
  item: Item
  onClose: () => void
}

export const MenuItemContent: FC<{
  icon?: ReactNode
  label: string
  trailing?: ReactNode
}> = ({ icon, label, trailing }) => {
  const { classes } = useMenuStyles()
  return (
    <>
      {icon && <ListItemIcon aria-hidden>{icon}</ListItemIcon>}
      <ListItemText>{label}</ListItemText>
      {trailing && <span className={classes.trailing}>{trailing}</span>}
    </>
  )
}

export const ActionMenuItem: FC<ItemProps<ActionItem>> = ({
  item,
  onClose,
  ...menuItemProps
}) => {
  const { classes } = useMenuStyles()
  return (
    <MenuItem
      {...menuItemProps}
      className={classes.item}
      data-destructive={item.destructive || undefined}
      disabled={item.disabled}
      onClick={() => {
        onClose()
        item.onClick()
      }}
    >
      <MenuItemContent
        trailing={item.shortcut}
        icon={item.icon}
        label={item.label}
      />
    </MenuItem>
  )
}

export const RadioMenuItem: FC<ItemProps<RadioItem>> = ({
  item,
  onClose,
  ...menuItemProps
}) => {
  const { classes } = useMenuStyles()
  return (
    <MenuItem
      {...menuItemProps}
      aria-checked={item.checked}
      disabled={item.disabled}
      onClick={() => {
        onClose()
        item.onClick()
      }}
      role="menuitemradio"
    >
      <MenuItemContent
        trailing={
          <MdCheck
            aria-hidden
            className={classes.check}
            data-checked={item.checked || undefined}
          />
        }
        icon={item.icon}
        label={item.label}
      />
    </MenuItem>
  )
}

export const SwitchMenuItem: FC<Omit<ItemProps<SwitchItem>, 'onClose'>> = ({
  item,
  ...menuItemProps
}) => (
  <MenuItem
    {...menuItemProps}
    aria-checked={item.checked}
    dense
    disabled={item.disabled}
    onClick={item.onClick}
    role="menuitemcheckbox"
  >
    <ListItemIcon>
      <Switch
        checked={item.checked}
        size="xsmall"
        slotProps={{ input: { tabIndex: -1, 'aria-hidden': true } }}
      />
    </ListItemIcon>
    <ListItemText>{item.label}</ListItemText>
  </MenuItem>
)

export const LinkMenuItem: FC<ItemProps<LinkItem>> = ({
  item,
  onClose,
  ...menuItemProps
}) => (
  <MenuItem
    {...menuItemProps}
    component={Link}
    disabled={item.disabled}
    onClick={onClose}
    selected={item.selected}
    to={item.to}
  >
    <MenuItemContent icon={item.icon} label={item.label} />
  </MenuItem>
)
