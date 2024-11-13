import { FC } from 'react'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AuthProvider } from 'providers'

import Header from './Header'

const Layout: FC = () => {
  return (
    <AuthProvider>
      <Header />
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-left" />
    </AuthProvider>
  )
}

export default Layout
