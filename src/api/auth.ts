import axios from 'axios'
import { LoginData, LoginInputs, RefreshTokenData } from 'types/auth'

export const loginUser = async (loginInputs: LoginInputs) => {
  const response = await axios.post<LoginData>(
    import.meta.env.VITE_APP_AUTH_BASE_URL,
    {
      ...loginInputs,
      returnSecureToken: true,
    }
  )
  return response.data
}

export const refreshSecureToken = async (refreshToken: string) => {
  const response = await axios.post<RefreshTokenData>(
    import.meta.env.VITE_APP_REFRESH_AUTH_BASE_URL,
    {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }
  )
  return response.data
}
