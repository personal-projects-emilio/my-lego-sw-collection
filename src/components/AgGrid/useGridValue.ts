import { useEffect, useState } from 'react'

import type { AgPublicEventType, GridApi } from 'ag-grid-community'

const useGridValue = <TData, Value>({
  api,
  eventTypes,
  read,
}: {
  api: GridApi<TData>
  eventTypes: readonly AgPublicEventType[]
  read: () => Value
}) => {
  const [value, setValue] = useState(read)

  useEffect(() => {
    const update = () => setValue(read())
    update()
    eventTypes.forEach((type) => api.addEventListener(type, update))
    return () => {
      if (!api.isDestroyed())
        eventTypes.forEach((type) => api.removeEventListener(type, update))
    }
  }, [api, eventTypes, read])

  return value
}

export default useGridValue
