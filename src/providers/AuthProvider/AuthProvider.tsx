import {
  type FC,
  type PropsWithChildren,
  useEffect,
  useEffectEvent,
  useState,
} from 'react'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { queryClient } from 'api'
import { queryKeys } from 'api/api.constants'
import { loginUser, refreshSecureToken } from 'api/auth'

import { AuthContext } from './AuthProvider.constants'

type Session = { idToken: string; userId?: string; expirationDate: string }

const clearAuthLocalStorage = () => {
  localStorage.removeItem('idToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('expirationDate')
  localStorage.removeItem('refreshToken')
}

const saveSession = ({
  idToken,
  userId,
  refreshToken,
  expiresIn,
}: {
  idToken: string
  userId: string
  refreshToken: string
  expiresIn: string
}): Session => {
  const expirationDate = new Date(
    Date.now() + parseInt(expiresIn, 10) * 1000
  ).toISOString()

  localStorage.setItem('idToken', idToken)
  localStorage.setItem('userId', userId)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('expirationDate', expirationDate)
  return { idToken, userId, expirationDate }
}

const readStoredSession = (): Session | undefined => {
  const idToken = localStorage.getItem('idToken')
  const userId = localStorage.getItem('userId') ?? undefined
  const expirationDate = localStorage.getItem('expirationDate')

  if (!idToken || !expirationDate) return undefined
  if (new Date(expirationDate) <= new Date()) {
    clearAuthLocalStorage()
    return undefined
  }
  return {
    idToken,
    userId,
    expirationDate: userId ? expirationDate : new Date().toISOString(),
  }
}

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const { history } = useRouter()
  const [session, setSession] = useState(readStoredSession)

  const logout = () => {
    clearAuthLocalStorage()
    setSession(undefined)
    queryClient.removeQueries({ queryKey: [queryKeys.columnLayout] })
  }

  const { mutate: mutateRefreshToken, isPending: isRefreshPending } =
    useMutation({
      mutationFn: refreshSecureToken,
      onSuccess: (data) => {
        if (!data) return
        const { expires_in, id_token, refresh_token, user_id } = data
        setSession(
          saveSession({
            idToken: id_token,
            userId: user_id,
            refreshToken: refresh_token,
            expiresIn: expires_in,
          })
        )
      },
      onError: () => {
        logout()
      },
    })

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ expiresIn, idToken, localId, refreshToken }) => {
      setSession(
        saveSession({ idToken, userId: localId, refreshToken, expiresIn })
      )
      history.back()
    },
    onError: () => {
      logout()
    },
  })

  const onSessionExpired = useEffectEvent(() => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return logout()
    mutateRefreshToken(refreshToken)
  })

  const expirationDate = session?.expirationDate

  useEffect(() => {
    if (!expirationDate) return
    const timeout = setTimeout(
      onSessionExpired,
      new Date(expirationDate).getTime() - Date.now()
    )
    return () => clearTimeout(timeout)
  }, [expirationDate])

  return (
    <AuthContext.Provider
      value={{
        idToken: session?.idToken,
        userId: session?.userId,
        login,
        logout,
        isLoading: isLoginPending || isRefreshPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
