import {
  type FC,
  type PropsWithChildren,
  useEffect,
  useEffectEvent,
  useState,
} from 'react'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { loginUser, refreshSecureToken } from 'api/auth'

import { AuthContext } from './AuthProvider.constants'

type Session = { idToken: string; expirationDate: string }

const clearAuthLocalStorage = () => {
  localStorage.removeItem('idToken')
  localStorage.removeItem('expirationDate')
  localStorage.removeItem('refreshToken')
}

const saveSession = (
  idToken: string,
  refreshToken: string,
  expiresIn: string
): Session => {
  const expirationDate = new Date(
    Date.now() + parseInt(expiresIn, 10) * 1000
  ).toISOString()

  localStorage.setItem('idToken', idToken)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('expirationDate', expirationDate)
  return { idToken, expirationDate }
}

const readStoredSession = (): Session | undefined => {
  const idToken = localStorage.getItem('idToken')
  const expirationDate = localStorage.getItem('expirationDate')

  if (!idToken || !expirationDate) return undefined
  if (new Date(expirationDate) <= new Date()) {
    clearAuthLocalStorage()
    return undefined
  }
  return { idToken, expirationDate }
}

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const { history } = useRouter()
  const [session, setSession] = useState(readStoredSession)

  const logout = () => {
    clearAuthLocalStorage()
    setSession(undefined)
  }

  const { mutate: mutateRefreshToken, isPending: isRefreshPending } =
    useMutation({
      mutationFn: refreshSecureToken,
      onSuccess: (data) => {
        if (!data) return
        const { expires_in, id_token, refresh_token } = data
        setSession(saveSession(id_token, refresh_token, expires_in))
      },
      onError: () => {
        logout()
      },
    })

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ expiresIn, idToken, refreshToken }) => {
      setSession(saveSession(idToken, refreshToken, expiresIn))
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
