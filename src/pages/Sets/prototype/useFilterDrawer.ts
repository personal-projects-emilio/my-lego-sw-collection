import { useEffect, useId, useState } from 'react'

import type { FilterRequest, SetsFilterField } from './setsFilter'

const useFilterDrawer = (request?: FilterRequest) => {
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [focusRequest, setFocusRequest] = useState<FilterRequest>()

  useEffect(() => {
    if (request) setFocusRequest(request)
  }, [request])

  useEffect(() => {
    if (!focusRequest) return
    setIsOpen(true)
    const timeout = setTimeout(
      () =>
        document.getElementById(`${panelId}-${focusRequest.field}`)?.focus(),
      250
    )
    return () => clearTimeout(timeout)
  }, [panelId, focusRequest])

  return {
    isOpen,
    onClose: () => setIsOpen(false),
    openField: (field: SetsFilterField) =>
      setFocusRequest({ field, requestedAt: Date.now() }),
    panelId,
    toggle: () => setIsOpen((open) => !open),
  }
}

export default useFilterDrawer
