/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_AUTH_BASE_URL: string
  readonly VITE_APP_REFRESH_AUTH_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
