import type { FC } from 'react'

import { Tab, Tabs } from '@mui/material'
import { createLink, Link } from '@tanstack/react-router'
import { useCurrentRoute } from 'hooks'
import { useAuth } from 'providers/AuthProvider'
import { keepSharedFilterSearch } from 'utils/itemsFilter'

const TabLink = createLink(Tab)

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
      <TabLink
        label="Minifigs"
        search={keepSharedFilterSearch}
        to="/minifigs"
        value="/minifigs"
      />
      <TabLink
        label="Sets"
        search={keepSharedFilterSearch}
        to="/sets"
        value="/sets"
      />
      <Tab component={Link} label="Timeline" to="/timeline" value="/timeline" />
      {idToken && (
        <TabLink
          label="Loose minifigs"
          search={keepSharedFilterSearch}
          to="/loose-minifigs"
          value="/loose-minifigs"
        />
      )}
      {idToken && (
        <TabLink
          label="Resale sets"
          search={keepSharedFilterSearch}
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
