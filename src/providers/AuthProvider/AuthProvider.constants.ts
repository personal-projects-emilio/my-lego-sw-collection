import { createContext, useContext } from 'react'

import type { UseMutateFunction } from '@tanstack/react-query'
import type { UserCredential } from 'firebase/auth'
import type { LoginInputs } from 'types/auth'

type Auth = {
  idToken?: string
  userId?: string
  login: UseMutateFunction<UserCredential, unknown, LoginInputs, unknown>
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<Auth>({
  idToken: undefined,
  userId: undefined,
  login: () => {},
  logout: () => {},
  isLoading: false,
})

export const useAuth = () => useContext(AuthContext)
