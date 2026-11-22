import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'

import type {
  ColDef,
  ColGroupDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community'
import {
  deleteColumnLayout,
  saveColumnLayout,
  useColumnLayoutQuery,
} from 'api/columnLayout'
import { debounce, type DebouncedFunc } from 'lodash'
import { useAuth } from 'providers/AuthProvider'
import type { ColumnLayout, ColumnLayoutId } from 'types/columnLayout'
import {
  toApplyColumnStateParams,
  toColumnLayout,
  toExcludedColIds,
  toVisibilityState,
} from 'utils/columnLayout'

const saveDelay = 400

const layoutEvents = [
  'columnMoved',
  'columnResized',
  'columnVisible',
  'columnPinned',
  'sortChanged',
] as const

const skippedSources = new Set(['flex', 'gridInitializing'])

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
  const isApplying = useRef(false)
  const appliedFor = useRef<string>(undefined)
  const previousExcluded = useRef<string[]>([])
  const pendingWrite =
    useRef<DebouncedFunc<(next: ColumnLayout) => void>>(undefined)
  const excludedColIds = useMemo(
    () => toExcludedColIds(columnDefs),
    [columnDefs]
  )
  const excludedKey = excludedColIds.join()

  const applySilently = (apply: () => void) => {
    isApplying.current = true
    try {
      apply()
    } finally {
      isApplying.current = false
    }
  }

  const applySaved = (gridApi: GridApi<TData>) => {
    appliedFor.current = userId
    if (layout)
      applySilently(() =>
        gridApi.applyColumnState(
          toApplyColumnStateParams({ layout, excludedColIds })
        )
      )
  }

  const onGridReady = ({ api: readyApi }: GridReadyEvent<TData>) => {
    applySaved(readyApi)
    setApi(readyApi)
  }

  const reapplySaved = useEffectEvent(() => {
    if (!api) return
    if (!userId) {
      appliedFor.current = undefined
      return
    }
    if (!isLoading && appliedFor.current !== userId) applySaved(api)
  })

  useEffect(() => reapplySaved(), [api, userId, isLoading])

  const syncExcluded = useEffectEvent(() => {
    if (!api) return
    const previous = previousExcluded.current
    previousExcluded.current = excludedColIds
    const changed = [...new Set([...previous, ...excludedColIds])].filter(
      (colId) => previous.includes(colId) !== excludedColIds.includes(colId)
    )
    if (changed.length)
      applySilently(() =>
        api.applyColumnState({
          state: toVisibilityState({ colIds: changed, excludedColIds, layout }),
        })
      )
  })

  useEffect(() => syncExcluded(), [api, excludedKey])

  useEffect(() => {
    if (error) console.error('Unable to load the column layout', error)
  }, [error])

  const buildLayout = useEffectEvent(() =>
    api && userId
      ? toColumnLayout({
          state: api.getColumnState(),
          excludedColIds,
          saved: layout,
        })
      : undefined
  )

  const write = useEffectEvent((next: ColumnLayout) => {
    if (!userId) return
    saveColumnLayout({ userId, columnLayoutId, layout: next })
      .then(() => setSaveError(undefined))
      .catch((saveFailure) => {
        console.error('Unable to save the column layout', saveFailure)
        setSaveError('Unable to save the column layout')
      })
  })

  useEffect(() => {
    if (!api) return
    const debouncedWrite = debounce(
      (next: ColumnLayout) => write(next),
      saveDelay
    )
    pendingWrite.current = debouncedWrite
    const onChange = (event: { source: string; finished?: boolean }) => {
      if (isApplying.current || skippedSources.has(event.source)) return
      if (event.finished === false) return
      const next = buildLayout()
      if (next) debouncedWrite(next)
    }
    layoutEvents.forEach((type) => api.addEventListener(type, onChange))
    return () => {
      debouncedWrite.flush()
      if (!api.isDestroyed())
        layoutEvents.forEach((type) => api.removeEventListener(type, onChange))
    }
  }, [api])

  const reset = async () => {
    if (!api) return
    pendingWrite.current?.cancel()
    applySilently(() => {
      api.resetColumnState()
      api.applyColumnState({
        state: toVisibilityState({ colIds: excludedColIds, excludedColIds }),
      })
    })
    if (!userId) return
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

  return {
    api,
    excludedColIds,
    isLoading,
    isResetting,
    onGridReady,
    reset,
    saveError,
    clearSaveError: () => setSaveError(undefined),
  }
}

export default useColumnLayout
