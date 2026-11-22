import type { ReactNode } from 'react'

import type { RouterRouteIds } from 'routes'

type BaseItem = {
  key: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export type ActionItem = BaseItem & {
  kind: 'action'
  onClick: () => void
  shortcut?: string
  destructive?: boolean
}

export type RadioItem = BaseItem & {
  kind: 'radio'
  checked: boolean
  onClick: () => void
}

export type SwitchItem = BaseItem & {
  kind: 'switch'
  checked: boolean
  onClick: () => void
}

export type LinkItem = BaseItem & {
  kind: 'link'
  to: RouterRouteIds
  selected?: boolean
}

export type SubmenuItem = BaseItem & {
  kind: 'submenu'
  items: MenuItemDefinition[]
  shortcut?: string
}

export type DividerItem = { kind: 'divider'; key: string }

export type MenuItemDefinition =
  ActionItem | RadioItem | SwitchItem | LinkItem | SubmenuItem | DividerItem

export type MenuAnchor = HTMLElement | { top: number; left: number }
