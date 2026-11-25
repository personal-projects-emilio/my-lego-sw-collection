import { type FC, type PropsWithChildren, useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { queryClient } from 'api'
import { queryKeys } from 'api/api.constants'
import { auth } from 'api/firebase'
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import type { LoginInputs } from 'types/auth'

import { AuthContext } from './AuthProvider.constants'

type Session = { idToken: string; userId: string }

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const { history } = useRouter()
  const [session, setSession] = useState<Session>()
  const [isReady, setIsReady] = useState(false)

  useEffect(
    () =>
      onIdTokenChanged(auth, async (user) => {
        setSession(
          user
            ? { idToken: await user.getIdToken(), userId: user.uid }
            : undefined
        )
        setIsReady(true)
      }),
    []
  )

  const logout = () => {
    void signOut(auth)
    queryClient.removeQueries({ queryKey: [queryKeys.columnLayout] })
  }

  const { mutate: login, isPending } = useMutation({
    mutationFn: ({ email, password }: LoginInputs) =>
      signInWithEmailAndPassword(auth, email, password),
    onSuccess: () => history.back(),
  })

  if (!isReady) return null

  return (
    <AuthContext.Provider
      value={{
        idToken: session?.idToken,
        userId: session?.userId,
        login,
        logout,
        isLoading: isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
