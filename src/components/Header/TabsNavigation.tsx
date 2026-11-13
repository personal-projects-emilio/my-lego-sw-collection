import type { FC } from 'react'

import { Tab, Tabs } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useCurrentRoute } from 'hooks'
import { useAuth } from 'providers/AuthProvider'

const TabsNavigation: FC = () => {
  const { idToken, logout } = useAuth()
  const currentRoute = useCurrentRoute()

  return (
    <Tabs
      value={
        idToken ||
        !['/loose-minifigs', '/resale-sets'].includes(String(currentRoute.id))
          ? currentRoute.id
          : false
      }
      aria-label="Application tab navigation"
      component="nav"
    >
      <Tab component={Link} label="Minifigs" to="/minifigs" value="/minifigs" />
      <Tab component={Link} label="Sets" to="/sets" value="/sets" />
      {idToken && (
        <Tab
          component={Link}
          label="Loose minifigs"
          to="/loose-minifigs"
          value="/loose-minifigs"
        />
      )}
      {idToken && (
        <Tab
          component={Link}
          label="Resale sets"
          to="/resale-sets"
          value="/resale-sets"
        />
      )}
      {idToken ? (
        <Tab label="Logout" onClick={logout} />
      ) : (
        <Tab component={Link} label="Login" to="/auth" value="/auth" />
      )}
    </Tabs>
  )
}

export default TabsNavigation
