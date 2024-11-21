import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { loginUser, refreshSecureToken } from 'api/auth'

import { AuthContext } from './AuthProvider.constants'

const clearAuthLocalStorage = () => {
  localStorage.removeItem('idToken')
  localStorage.removeItem('expirationDate')
  localStorage.removeItem('refreshToken')
}

let expireAuthTiemout: ReturnType<typeof setTimeout>

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate()
  const [idToken, setIdToken] = useState<string>()

  const { mutate: mutateRefreshToken, isPending: isRefreshPending } =
    useMutation({
      mutationFn: refreshSecureToken,
      onSuccess: (data) => {
        if (!data) return
        const { expires_in, id_token, refresh_token } = data
        clearTimeout(expireAuthTiemout)
        setIdToken(id_token)
        const expirationDate = new Date(
          new Date().getTime() + parseInt(expires_in, 10) * 1000
        ).toISOString()

        localStorage.setItem('idToken', id_token)
        localStorage.setItem('refreshToken', refresh_token)
        localStorage.setItem('expirationDate', expirationDate)
        setAuthTimeout(expirationDate)
      },
      onError: () => {
        logout()
      },
    })

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ expiresIn, idToken: newIdToken, refreshToken }) => {
      setIdToken(newIdToken)
      const expirationDate = new Date(
        new Date().getTime() + parseInt(expiresIn, 10) * 1000
      ).toISOString()

      localStorage.setItem('idToken', newIdToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('expirationDate', expirationDate)
      navigate({ to: '/minifigs' })
    },
    onError: () => {
      logout()
    },
  })

  const logout = useCallback(() => {
    clearAuthLocalStorage()
    setIdToken(undefined)
    navigate({ to: '/auth' })
    clearTimeout(expireAuthTiemout)
  }, [navigate])

  const setAuthTimeout = useCallback(
    (expirationDate: string) => {
      expireAuthTiemout = setTimeout(
        () => {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) return logout()
          mutateRefreshToken(refreshToken)
        },
        new Date(expirationDate).getTime() - new Date().getTime()
      )
    },
    [logout, mutateRefreshToken]
  )

  useEffect(() => {
    const storageIdToken = localStorage.getItem('idToken')
    const storageExpirationDate = localStorage.getItem('expirationDate')

    if (!storageIdToken || !storageExpirationDate)
      return clearTimeout(expireAuthTiemout)
    if (new Date(storageExpirationDate) <= new Date())
      return clearAuthLocalStorage()

    setIdToken(storageIdToken)
    setAuthTimeout(storageExpirationDate)
  }, [setAuthTimeout])

  return (
    <AuthContext.Provider
      value={{
        idToken,
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
