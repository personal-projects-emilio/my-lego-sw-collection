import { type FC, useMemo, useState } from 'react'

import { Skeleton } from '@mui/material'
import { Navigate, Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { useCollection } from 'hooks'
import { defaultMinifigsColumnDefs } from 'pages/Minifigs/Minifigs.constants'
import { useAuth } from 'providers/AuthProvider'
import { formatFrEuroCurrency } from 'utils/format'

import useLooseMinifigsColDefs from './useLooseMinifigsColDefs'

const LooseMinifigs: FC = () => {
  const { idToken } = useAuth()
  const { minifigsList, isLoading } = useCollection()
  const columnDefs = useLooseMinifigsColDefs()
  const [quickFilter, setQuickFilter] = useState('')

  const looseMinifigs = useMemo(
    () => minifigsList?.filter(({ owned }) => owned.loose.quantity > 0),
    [minifigsList]
  )

  const statistics = useMemo(
    () =>
      (looseMinifigs ?? []).reduce(
        (totals, { owned: { loose } }) => ({
          quantity: totals.quantity + loose.quantity,
          bought: totals.bought + loose.quantity * loose.unitBoughtPrice,
          marketValue:
            totals.marketValue + loose.quantity * loose.unitMarketValue,
        }),
        { quantity: 0, bought: 0, marketValue: 0 }
      ),
    [looseMinifigs]
  )

  if (!idToken) return <Navigate to="/minifigs" />

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader
        addTo="/loose-minifigs/add"
        hideBricksetImport
        setQuickFilter={setQuickFilter}
        statisticsTooltipTitle={`You have ${statistics.quantity} loose minifigs across ${looseMinifigs?.length ?? 0} variants. You have spent ${formatFrEuroCurrency(statistics.bought)} on them and their market value is ${formatFrEuroCurrency(statistics.marketValue)}`}
      />
      <AgGridTable
        columnDefs={columnDefs}
        defaultColDef={defaultMinifigsColumnDefs}
        getRowId={({ data }) => data.id}
        quickFilterText={quickFilter}
        rowData={looseMinifigs}
      />
      <Outlet />
    </>
  )
}

export default LooseMinifigs
