import { createContext, useContext } from 'react'

export const OpenTagsDrawerContext = createContext<() => void>(() => undefined)

export const useOpenTagsDrawer = () => useContext(OpenTagsDrawerContext)
