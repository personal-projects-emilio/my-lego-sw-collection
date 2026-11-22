import { type KeyboardEvent, type PointerEvent, useState } from 'react'

const keyboardStep = 32

type DrawerWidthOptions = {
  storageKey: string
  defaultWidth: number
  minWidth: number
  maxWidth?: number
}

const useDrawerWidth = ({
  storageKey,
  defaultWidth,
  minWidth,
  maxWidth = window.innerWidth,
}: DrawerWidthOptions) => {
  const clamp = (width: number) =>
    Math.round(Math.min(Math.max(width, minWidth), maxWidth))

  const [storedWidth, setStoredWidth] = useState(() => {
    try {
      return Number(localStorage.getItem(storageKey)) || defaultWidth
    } catch {
      return defaultWidth
    }
  })
  const width = clamp(storedWidth)

  const store = (next: number) => {
    try {
      localStorage.setItem(storageKey, String(next))
    } catch {
      return
    }
  }

  const resize = (next: number) => {
    const clamped = clamp(next)
    setStoredWidth(clamped)
    return clamped
  }

  const handleProps = {
    'aria-label': 'Resize the drawer',
    'aria-orientation': 'vertical' as const,
    'aria-valuemax': Math.round(maxWidth),
    'aria-valuemin': minWidth,
    'aria-valuenow': width,
    role: 'separator',
    tabIndex: 0,
    onDoubleClick: () => store(resize(defaultWidth)),
    onKeyDown: (event: KeyboardEvent) => {
      const step = { ArrowLeft: keyboardStep, ArrowRight: -keyboardStep }[
        event.key
      ]
      if (!step) return
      event.preventDefault()
      store(resize(width + step))
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
      const right =
        event.currentTarget.parentElement?.getBoundingClientRect().right ??
        window.innerWidth
      resize(right - event.clientX)
    },
    onPointerUp: () => store(width),
  }

  return { width, handleProps }
}

export default useDrawerWidth
