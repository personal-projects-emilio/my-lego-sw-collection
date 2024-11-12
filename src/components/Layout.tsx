import { FC } from 'react'

import Minifigs from 'pages/Minifigs'

import Header from './Header'

export const Layout: FC = () => {
  return (
    <>
      <Header />
      <Minifigs />
    </>
  )
}

export default Layout
