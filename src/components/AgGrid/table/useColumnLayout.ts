import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type {
  GridApi,
  GridOptions,
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
import type { ColumnLayout, ColumnLayoutId } from 'types/columnLayout'
import {
  hideExcluded,
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
  columnDefs: GridOptions<TData>['columnDefs']
}) => {
  const { idToken, userId } = useAuth()
  const {
    data: layout,
    error,
    isLoading,
  } = useColumnLayoutQuery(columnLayoutId)
  const [api, setApi] = useState<GridApi<TData>>()
  const [saveError, setSaveError] = useState<string>()
  const [dismissedLoadError, setDismissedLoadError] = useState<Error>()
  const [isResetting, setIsResetting] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const [totalRowOverride, setTotalRowOverride] = useState<{
    userId?: string
    isTotalRowShown: boolean
  }>()
  const isTotalRowShown =
    (totalRowOverride && totalRowOverride.userId === userId
      ? totalRowOverride.isTotalRowShown
      : undefined) ??
    layout?.isTotalRowShown ??
    true
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

  useEffect(() => () => void debouncedSave.flush(), [debouncedSave, userId])

  useEffect(() => {
    if (error) console.error('Unable to load the column layout', error)
  }, [error])

  const saveLayout = useCallback(
    (next: ColumnLayout) => {
      const key = JSON.stringify(next)
      if (!userId || !idToken || error || key === lastSaved.current) return
      lastSaved.current = key
      debouncedSave({ idToken, userId, columnLayoutId, layout: next })
    },
    [columnLayoutId, debouncedSave, error, idToken, userId]
  )

  const onGridReady = ({ api: readyApi }: GridReadyEvent<TData>) => {
    lastSaved.current = JSON.stringify({
      columnState: readyApi.getColumnState(),
      isTotalRowShown,
    })
    setApi(readyApi)
  }

  const onStateUpdated = ({
    api: updatedApi,
    sources,
  }: StateUpdatedEvent<TData>) => {
    if (sources.includes('gridInitializing')) return
    if (!sources.some((source) => layoutSources.has(source))) return
    saveLayout({ columnState: updatedApi.getColumnState(), isTotalRowShown })
  }

  const toggleTotalRow = useCallback(
    (gridApi: GridApi) => {
      const next = !isTotalRowShown
      setTotalRowOverride({ userId, isTotalRowShown: next })
      saveLayout({
        columnState: gridApi.getColumnState(),
        isTotalRowShown: next,
      })
    },
    [isTotalRowShown, saveLayout, userId]
  )

  const reset = async () => {
    debouncedSave.cancel()
    setTotalRowOverride(undefined)
    if (userId && idToken) {
      setIsResetting(true)
      try {
        await deleteColumnLayout({ idToken, userId, columnLayoutId })
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
    canSave: !!userId && !!idToken,
    clearSaveError: () => {
      setSaveError(undefined)
      setDismissedLoadError(error ?? undefined)
    },
    columnDefs: useMemo(() => hideExcluded(columnDefs), [columnDefs]),
    excludedColIds,
    gridKey: resetCount,
    initialState: useMemo(
      () =>
        layout
          ? toInitialState({ columnState: layout.columnState, excludedColIds })
          : undefined,
      [layout, excludedColIds]
    ),
    isLoading,
    isResetting,
    onGridReady,
    onStateUpdated,
    reset,
    isTotalRowShown,
    toggleTotalRow,
    saveError:
      saveError ??
      (error && error !== dismissedLoadError
        ? 'Unable to load your column layout, so column changes are not saved'
        : undefined),
  }
}

export default useColumnLayout
