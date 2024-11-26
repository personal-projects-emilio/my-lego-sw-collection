import type { FC, PropsWithChildren } from 'react'

import { QueryClientProvider as OriginalQueryClientProvider } from '@tanstack/react-query'
import { queryClient } from 'api'

const QueryClientProvider: FC<PropsWithChildren> = ({ children }) => (
  <OriginalQueryClientProvider client={queryClient}>
    {children}
  </OriginalQueryClientProvider>
)

export default QueryClientProvider
