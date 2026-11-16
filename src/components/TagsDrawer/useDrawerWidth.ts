import { type KeyboardEvent, type PointerEvent, useState } from 'react'

const storageKey = 'tagsDrawerWidth'
const defaultWidth = 480
const minWidth = 360
const keyboardStep = 32

const clamp = (width: number) =>
  Math.round(Math.min(Math.max(width, minWidth), window.innerWidth))

const storedWidth = () => {
  try {
    const width = Number(localStorage.getItem(storageKey))
    return width ? clamp(width) : defaultWidth
  } catch {
    return defaultWidth
  }
}

const store = (width: number) => {
  try {
    localStorage.setItem(storageKey, String(width))
  } catch {
    return
  }
}

const useDrawerWidth = () => {
  const [width, setWidth] = useState(storedWidth)

  const resize = (next: number) => {
    const clamped = clamp(next)
    setWidth(clamped)
    return clamped
  }

  const handleProps = {
    'aria-label': 'Resize the drawer',
    'aria-orientation': 'vertical' as const,
    'aria-valuemax': window.innerWidth,
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
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        resize(window.innerWidth - event.clientX)
    },
    onPointerUp: () => store(width),
  }

  return { width, handleProps }
}

export default useDrawerWidth
