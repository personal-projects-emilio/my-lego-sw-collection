import { Divider } from '@mui/material'

import type { MenuItemDefinition } from './menu.types'
import {
  ActionMenuItem,
  LinkMenuItem,
  RadioMenuItem,
  SwitchMenuItem,
} from './MenuItems'
import NestedMenuItem from './NestedMenuItem'

export const renderMenuItems = ({
  items,
  onClose,
}: {
  items: MenuItemDefinition[]
  onClose: () => void
}) =>
  items.map((item) => {
    switch (item.kind) {
      case 'divider':
        return <Divider key={item.key} />
      case 'action':
        return <ActionMenuItem key={item.key} item={item} onClose={onClose} />
      case 'radio':
        return <RadioMenuItem key={item.key} item={item} onClose={onClose} />
      case 'switch':
        return <SwitchMenuItem key={item.key} item={item} />
      case 'link':
        return <LinkMenuItem key={item.key} item={item} onClose={onClose} />
      case 'submenu':
        return <NestedMenuItem key={item.key} item={item} onClose={onClose} />
    }
  })
