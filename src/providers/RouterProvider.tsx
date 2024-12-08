import type { FC } from 'react'

import { RouterProvider as OriginalRouterProvider } from '@tanstack/react-router'
import { router } from 'routes'

const RouterProvider: FC = () => <OriginalRouterProvider router={router} />

export default RouterProvider
