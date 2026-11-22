import { useEffect, useMemo, useRef, useState } from 'react'

import type {
  ColDef,
  ColGroupDef,
  GridApi,
  GridReadyEvent,
  StateUpdatedEvent,
} from 'ag-grid-community'
import {
  deleteColumnLayout,
  saveColumnLayout,
  useColumnLayoutQuery,
} from 'api/columnLayout'
import debounce from 'lodash/debounce'
import { useAuth } from 'providers/AuthProvider'
import type { ColumnLayoutId } from 'types/columnLayout'
import {
  hideExcluded,
  toColumnLayout,
  toExcludedColIds,
  toInitialState,
} from 'utils/columnLayout'

const saveDelay = 400

const layoutSources = new Set<string>([
  'columnOrder',
  'columnPinning',
  'columnSizing',
  'columnVisibility',
  'sort',
])

const useColumnLayout = <TData>({
  columnLayoutId,
  columnDefs,
}: {
  columnLayoutId: ColumnLayoutId
  columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null
}) => {
  const { userId } = useAuth()
  const {
    data: layout,
    error,
    isLoading,
  } = useColumnLayoutQuery(columnLayoutId)
  const [api, setApi] = useState<GridApi<TData>>()
  const [saveError, setSaveError] = useState<string>()
  const [isResetting, setIsResetting] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const lastSaved = useRef<string>(undefined)
  const excludedColIds = useMemo(
    () => toExcludedColIds(columnDefs),
    [columnDefs]
  )
  const [debouncedSave] = useState(() =>
    debounce((target: Parameters<typeof saveColumnLayout>[0]) => {
      saveColumnLayout(target)
        .then(() => setSaveError(undefined))
        .catch((saveFailure) => {
          console.error('Unable to save the column layout', saveFailure)
          setSaveError('Unable to save the column layout')
        })
    }, saveDelay)
  )

  useEffect(() => () => void debouncedSave.flush(), [debouncedSave])

  useEffect(() => {
    if (error) console.error('Unable to load the column layout', error)
  }, [error])

  const onStateUpdated = ({ sources, state }: StateUpdatedEvent<TData>) => {
    const next = toColumnLayout({ state, excludedColIds })
    const key = JSON.stringify(next)
    if (sources.includes('gridInitializing')) {
      lastSaved.current = key
      return
    }
    if (!userId || key === lastSaved.current) return
    if (!sources.some((source) => layoutSources.has(source))) return
    lastSaved.current = key
    debouncedSave({ userId, columnLayoutId, layout: next })
  }

  const reset = async () => {
    debouncedSave.cancel()
    if (userId) {
      setIsResetting(true)
      try {
        await deleteColumnLayout({ userId, columnLayoutId })
        setSaveError(undefined)
      } catch (resetFailure) {
        console.error('Unable to reset the column layout', resetFailure)
        setSaveError('Unable to reset the column layout')
      } finally {
        setIsResetting(false)
      }
    }
    setResetCount((count) => count + 1)
  }

  return {
    api,
    clearSaveError: () => setSaveError(undefined),
    columnDefs: useMemo(() => hideExcluded(columnDefs), [columnDefs]),
    excludedColIds,
    gridKey: `${userId}-${resetCount}`,
    initialState: useMemo(
      () => toInitialState({ layout, excludedColIds }),
      [layout, excludedColIds]
    ),
    isLoading,
    isResetting,
    onGridReady: ({ api: readyApi }: GridReadyEvent<TData>) => setApi(readyApi),
    onStateUpdated,
    reset,
    saveError,
  }
}

export default useColumnLayout
