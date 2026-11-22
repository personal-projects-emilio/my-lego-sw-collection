import { type FC, useDeferredValue, useState } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { useCollection } from 'hooks'
import { useAuth } from 'providers/AuthProvider'
import { formatFrEuroCurrency, formatPercentage } from 'utils/format'

import { useSetsColDefs, useSetsStatistics } from './hooks'
import { defaultSetsColumnDefs } from './Sets.constants'

const Sets: FC = () => {
  const { setsList, isLoading } = useCollection()
  const setsColumnDefs = useSetsColDefs()
  const [quickFilter, setQuickFilter] = useState('')
  const deferredQuickFilter = useDeferredValue(quickFilter)
  const {
    owned,
    percentageOwned,
    total,
    totalBought,
    totalMarketValue,
    totalStoreValue,
  } = useSetsStatistics()
  const { idToken } = useAuth()

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader
        addTo="/sets/add"
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        statisticsTooltipTitle={`You owned ${owned} of the ${total} sets in our database (${formatPercentage(percentageOwned)})${idToken ? `. You have spend ${formatFrEuroCurrency(totalBought)} on your collection. The store value of your collection is ${formatFrEuroCurrency(totalStoreValue)} and the market value ${formatFrEuroCurrency(totalMarketValue)}` : ''}`}
      />
      <AgGridTable
        columnLayoutId="sets"
        columnDefs={setsColumnDefs}
        defaultColDef={defaultSetsColumnDefs}
        quickFilterText={deferredQuickFilter}
        rowData={setsList}
      />
      <Outlet />
    </>
  )
}

export default Sets
