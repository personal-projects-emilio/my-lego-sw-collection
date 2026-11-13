import { type FC, useMemo, useState } from 'react'

import { Alert, FormControlLabel, Skeleton, Switch } from '@mui/material'
import { Navigate, Outlet } from '@tanstack/react-router'
import type { ModelUpdatedEvent } from 'ag-grid-community'
import { useResaleSetsQuery } from 'api/resaleSets'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import isEqual from 'lodash/isEqual'
import { defaultSetsColumnDefs } from 'pages/Sets/Sets.constants'
import { useAuth } from 'providers/AuthProvider'
import { getResaleTotals, getResaleValues } from 'utils/lego'

import useResaleSetsColDefs, { type ResaleSetRow } from './useResaleSetsColDefs'

const ResaleSets: FC = () => {
  const { idToken } = useAuth()
  const { data: resaleSetsList, isError, isLoading } = useResaleSetsQuery()
  const columnDefs = useResaleSetsColDefs()
  const [quickFilter, setQuickFilter] = useState('')
  const [inStockOnly, setInStockOnly] = useState(true)
  const [totals, setTotals] = useState(() => getResaleTotals([]))

  const rows = useMemo(
    () =>
      (resaleSetsList ?? [])
        .filter(
          ({ quantityBought, quantitySold }) =>
            !inStockOnly || quantitySold < quantityBought
        )
        .map((resaleSet) => ({ ...resaleSet, ...getResaleValues(resaleSet) })),
    [inStockOnly, resaleSetsList]
  )

  const pinnedBottomRowData = useMemo(
    () => [{ id: 'Total', ...totals }],
    [totals]
  )

  const onModelUpdated = ({ api }: ModelUpdatedEvent<ResaleSetRow>) => {
    const visibleRows: ResaleSetRow[] = []
    api.forEachNodeAfterFilter(({ data }) => data && visibleRows.push(data))
    const visibleTotals = getResaleTotals(visibleRows)
    setTotals((previous) =>
      isEqual(previous, visibleTotals) ? previous : visibleTotals
    )
  }

  if (!idToken) return <Navigate to="/sets" />

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  if (isError)
    return <Alert severity="error">Unable to load your resale sets</Alert>

  return (
    <>
      <ModuleHeader
        addTo="/resale-sets/add"
        setQuickFilter={setQuickFilter}
        statisticsTooltipTitle={`You have ${resaleSetsList?.length ?? 0} sets in your resale table`}
      >
        <FormControlLabel
          control={
            <Switch
              checked={inStockOnly}
              onChange={(_, checked) => setInStockOnly(checked)}
            />
          }
          label="In stock only"
        />
      </ModuleHeader>
      <AgGridTable
        columnDefs={columnDefs}
        defaultColDef={defaultSetsColumnDefs}
        getRowId={({ data }) => String(data.id)}
        onModelUpdated={onModelUpdated}
        pinnedBottomRowData={pinnedBottomRowData}
        quickFilterText={quickFilter}
        rowData={rows}
      />
      <Outlet />
    </>
  )
}

export default ResaleSets
