import { type FC, useMemo, useState } from 'react'

import { Alert, FormControlLabel, Skeleton, Switch } from '@mui/material'
import { Navigate, Outlet } from '@tanstack/react-router'
import { useResaleSetsQuery } from 'api/resaleSets'
import { AgGridTable } from 'components/AgGrid/table'
import { ItemsFilterBar, useItemsFilter } from 'components/ItemsFilter'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { defaultSetsColumnDefs } from 'pages/Sets/Sets.constants'
import { useAuth } from 'providers/AuthProvider'
import { getResaleTotals, getResaleValues } from 'utils/lego'

import { resaleSetsFilterConfig } from './resaleSetsFilterConfig'
import useResaleSetsColDefs from './useResaleSetsColDefs'

const ResaleSets: FC = () => {
  const { idToken } = useAuth()
  const { data: resaleSetsList, isError, isLoading } = useResaleSetsQuery()
  const columnDefs = useResaleSetsColDefs()
  const [inStockOnly, setInStockOnly] = useState(true)

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

  const itemsFilter = useItemsFilter({
    columnLayoutId: 'resaleSets',
    config: resaleSetsFilterConfig,
    items: rows,
  })

  if (!idToken) return <Navigate to="/sets" />

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  if (isError)
    return <Alert severity="error">Unable to load your resale sets</Alert>

  return (
    <>
      <ModuleHeader addLabel="Add resale set" addTo="/resale-sets/add">
        <ItemsFilterBar {...itemsFilter.barProps} />
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
        columnLayoutId="resaleSets"
        columnDefs={columnDefs}
        defaultColDef={defaultSetsColumnDefs}
        getRowId={({ data }) => String(data.id)}
        getTotalRow={({ rows: visibleRows }) => ({
          id: 'Total',
          ...getResaleTotals(visibleRows),
        })}
        {...itemsFilter.gridProps}
        rowData={rows}
      />
      <Outlet />
    </>
  )
}

export default ResaleSets
