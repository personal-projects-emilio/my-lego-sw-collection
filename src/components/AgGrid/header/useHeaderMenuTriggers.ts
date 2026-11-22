import { type RefObject, useEffect } from 'react'

import type { MenuAnchor } from 'components/Menu'

const useHeaderMenuTriggers = ({
  eGridHeader,
  buttonRef,
  open,
}: {
  eGridHeader: HTMLElement
  buttonRef: RefObject<HTMLButtonElement | null>
  open: (anchor: MenuAnchor) => void
}) => {
  useEffect(() => {
    const openFromButton = () => buttonRef.current && open(buttonRef.current)
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      if (event.clientX === 0 && event.clientY === 0) return openFromButton()
      open({ top: event.clientY, left: event.clientX })
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== eGridHeader) return
      if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault()
        openFromButton()
      }
    }
    eGridHeader.addEventListener('contextmenu', onContextMenu)
    eGridHeader.addEventListener('keydown', onKeyDown)
    return () => {
      eGridHeader.removeEventListener('contextmenu', onContextMenu)
      eGridHeader.removeEventListener('keydown', onKeyDown)
    }
  }, [eGridHeader, buttonRef, open])
}

export default useHeaderMenuTriggers
