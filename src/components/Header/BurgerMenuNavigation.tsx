import { type FC, useId, useState } from 'react'
import { MdMenu } from 'react-icons/md'

import { IconButton, type IconButtonProps, Menu, MenuItem } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useCurrentRoute } from 'hooks'
import { useAuth } from 'providers'
import type { RouterRouteIds } from 'routes'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles({ name: 'BurgerMenuNavigation' })((theme) => ({
  menu: {
    '& .Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightBold,
    },
  },
}))

type LinkMenuItemProps = {
  to: RouterRouteIds
  label: string
  onClick: () => void
}

const LinkMenuItem: FC<LinkMenuItemProps> = ({ to, label, onClick }) => {
  const currentRoute = useCurrentRoute()

  return (
    <MenuItem
      component={Link}
      onClick={onClick}
      selected={currentRoute.id === to}
      to={to}
    >
      {label}
    </MenuItem>
  )
}

const BurgerMenuNavigation: FC = () => {
  const { classes } = useStyles()
  const { idToken, logout } = useAuth()
  const menuId = useId()
  const iconButtonId = useId()
  const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null)

  const isOpen = Boolean(anchorEl)

  const handleOpenMenu: IconButtonProps['onClick'] = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => setAnchorEl(null)

  const handleLogout = () => {
    handleCloseMenu()
    logout()
  }

  return (
    <>
      <IconButton
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen ? 'true' : undefined}
        aria-haspopup="true"
        aria-label="Application burger menu"
        id={iconButtonId}
        onClick={handleOpenMenu}
      >
        <MdMenu />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        aria-labelledby={iconButtonId}
        className={classes.menu}
        component="nav"
        id={menuId}
        onClose={handleCloseMenu}
        open={isOpen}
        role="navigation"
      >
        <LinkMenuItem
          to="/minifigs"
          label="Minifigs"
          onClick={handleCloseMenu}
        />
        <LinkMenuItem to="/sets" label="Sets" onClick={handleCloseMenu} />
        {idToken ? (
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        ) : (
          <LinkMenuItem to="/auth" label="Login" onClick={handleCloseMenu} />
        )}
      </Menu>
    </>
  )
}

export default BurgerMenuNavigation
