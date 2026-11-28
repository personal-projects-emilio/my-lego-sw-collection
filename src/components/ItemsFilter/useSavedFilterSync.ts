import { useEffect, useRef, useState } from 'react'

import { saveFilter, useSavedFilterQuery } from 'api/savedFilter'
import debounce from 'lodash/debounce'
import { useAuth } from 'providers/AuthProvider'
import type { FilterSearch } from 'types/itemsFilter'
import { hasFilterSearch, pickFilterSearch } from 'utils/itemsFilter'

const saveDelay = 400

const useSavedFilterSync = ({
  filterSearch,
  setFilterSearch,
}: {
  filterSearch: FilterSearch
  setFilterSearch: (search: FilterSearch) => void
}) => {
  const { idToken, userId } = useAuth()
  const { data: saved, isSuccess } = useSavedFilterQuery()
  const restoredUserId = useRef<string>(undefined)
  const lastSaved = useRef<string>(undefined)
  const [debouncedSave] = useState(() =>
    debounce((target: Parameters<typeof saveFilter>[0]) => {
      saveFilter(target).catch((saveFailure) =>
        console.error('Unable to save the filter', saveFailure)
      )
    }, saveDelay)
  )

  useEffect(() => () => void debouncedSave.flush(), [debouncedSave])

  useEffect(() => {
    if (!isSuccess || !userId || !idToken) return
    if (restoredUserId.current !== userId) {
      restoredUserId.current = userId
      lastSaved.current = JSON.stringify(pickFilterSearch(saved ?? {}))
      if (saved && !hasFilterSearch(filterSearch)) {
        setFilterSearch(saved)
        return
      }
    }
    const key = JSON.stringify(filterSearch)
    if (key === lastSaved.current) return
    lastSaved.current = key
    debouncedSave({ filter: filterSearch, idToken, userId })
  }, [
    debouncedSave,
    filterSearch,
    idToken,
    isSuccess,
    saved,
    setFilterSearch,
    userId,
  ])
}

export default useSavedFilterSync
