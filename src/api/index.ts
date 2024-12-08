import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// We add the auth token for mutation queries
api.interceptors.request.use((config) => {
  const idToken = localStorage.getItem('idToken')
  if (config.method?.toLowerCase() !== 'get' && idToken) {
    config.params = {
      auth: idToken,
    }
  }
  return config
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 100,
    },
  },
})
