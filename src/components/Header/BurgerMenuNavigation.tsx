import { FC, useId, useState } from 'react'
import { MdMenu } from 'react-icons/md'

import { IconButton, type IconButtonProps, Menu, MenuItem } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useCurrentRoute } from 'hooks'
import { useAuth } from 'providers'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
  menu: {
    '& .Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightBold,
    },
  },
}))

const BurgerMenuNavigation: FC = () => {
  const { classes } = useStyles()
  const { idToken, logout } = useAuth()
  const menuId = useId()
  const iconButtonId = useId()
  const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null)
  const currentRoute = useCurrentRoute()

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
        <MenuItem
          component={Link}
          onClick={handleCloseMenu}
          selected={currentRoute.id === '/minifigs'}
          to="/minifigs"
        >
          Minifigs
        </MenuItem>
        {idToken ? (
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        ) : (
          <MenuItem
            component={Link}
            onClick={handleCloseMenu}
            selected={currentRoute.id === '/auth'}
            to="/auth"
          >
            Login
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default BurgerMenuNavigation
