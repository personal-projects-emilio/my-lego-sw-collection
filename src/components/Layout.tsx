import type { FC } from 'react'

import { Outlet } from '@tanstack/react-router'
import AuthProvider from 'providers/AuthProvider'

import Header from './Header'
import { TagsDrawerProvider } from './TagsDrawer'

const Layout: FC = () => {
  return (
    <AuthProvider>
      <TagsDrawerProvider>
        <Header />
        <Outlet />
      </TagsDrawerProvider>
    </AuthProvider>
  )
}

export default Layout
