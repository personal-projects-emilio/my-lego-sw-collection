import { createContext, useContext } from 'react'

import type { UseMutateFunction } from '@tanstack/react-query'
import type { LoginData, LoginInputs } from 'types/auth'

type Auth = {
  idToken?: LoginData['idToken']
  userId?: LoginData['localId']
  login: UseMutateFunction<LoginData, unknown, LoginInputs, unknown>
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
