import type { FC } from 'react'

import { Outlet } from '@tanstack/react-router'
import AuthProvider from 'providers/AuthProvider'

import Header from './Header'

const Layout: FC = () => {
  return (
    <AuthProvider>
      <Header />
      <Outlet />
    </AuthProvider>
  )
}

export default Layout
