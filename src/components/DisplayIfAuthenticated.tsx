import type { FC, PropsWithChildren } from 'react'

import { useAuth } from 'providers'
import { isNotNullOrUndefined } from 'utils/typescript'

const DisplayIfAuthenticated: FC<PropsWithChildren> = ({ children }) => {
  const { idToken } = useAuth()

  if (!isNotNullOrUndefined(idToken)) return null

  return <>{children}</>
}

export default DisplayIfAuthenticated
