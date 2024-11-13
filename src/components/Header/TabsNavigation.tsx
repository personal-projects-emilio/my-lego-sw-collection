import { FC } from 'react'

import { Tab, Tabs } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useCurrentRoute } from 'hooks'
import { useAuth } from 'providers'

const TabsNavigation: FC = () => {
  const { idToken, logout } = useAuth()
  const currentRoute = useCurrentRoute()

  return (
    <Tabs
      value={currentRoute.id}
      aria-label="Application tab navigation"
      component="nav"
    >
      <Tab component={Link} label="Minifigs" to="/minifigs" value="/minifigs" />
      {idToken ? (
        <Tab label="Logout" onClick={logout} />
      ) : (
        <Tab component={Link} label="Login" to="/auth" value="/auth" />
      )}
    </Tabs>
  )
}

export default TabsNavigation
