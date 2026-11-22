import { type FC, useId, useState } from 'react'
import { MdMenu } from 'react-icons/md'

import { IconButton } from '@mui/material'
import { Menu, type MenuItemDefinition } from 'components/Menu'
import { useCurrentRoute } from 'hooks'
import { useAuth } from 'providers/AuthProvider'
import type { RouterRouteIds } from 'routes'

const BurgerMenuNavigation: FC = () => {
  const { idToken, logout } = useAuth()
  const currentRoute = useCurrentRoute()
  const menuId = useId()
  const iconButtonId = useId()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>()

  const isOpen = Boolean(anchorEl)

  const link = ({
    to,
    label,
  }: {
    to: RouterRouteIds
    label: string
  }): MenuItemDefinition => ({
    kind: 'link',
    key: to,
    label,
    to,
    selected: currentRoute.id === to,
  })

  const items: MenuItemDefinition[] = [
    link({ to: '/minifigs', label: 'Minifigs' }),
    link({ to: '/sets', label: 'Sets' }),
    link({ to: '/timeline', label: 'Timeline' }),
    ...(idToken
      ? [
          link({ to: '/loose-minifigs', label: 'Loose minifigs' }),
          link({ to: '/resale-sets', label: 'Resale sets' }),
          {
            kind: 'action',
            key: 'logout',
            label: 'Logout',
            onClick: logout,
          } as const,
        ]
      : [link({ to: '/auth', label: 'Login' })]),
  ]

  return (
    <>
      <IconButton
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen ? 'true' : undefined}
        aria-haspopup="true"
        aria-label="Application burger menu"
        id={iconButtonId}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MdMenu />
      </IconButton>
      <Menu
        anchor={anchorEl}
        aria-labelledby={iconButtonId}
        id={menuId}
        items={items}
        onClose={() => setAnchorEl(undefined)}
      />
    </>
  )
}

export default BurgerMenuNavigation
