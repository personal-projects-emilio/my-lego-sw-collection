import { type FC, useState } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { useSetsQuery } from 'api/sets'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader'
import { useAuth } from 'providers'
import { formatFrEuroCurrency, formatPercentage } from 'utils/format'

import { useSetsColDefs, useSetsStatistics } from './hooks'
import { defaultSetsColumnDefs } from './Sets.constants'

const Sets: FC = () => {
  const { data, isLoading } = useSetsQuery()
  const setsColumnDefs = useSetsColDefs()
  const [quickFilter, setQuickFilter] = useState('')
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
        setQuickFilter={setQuickFilter}
        statisticsTooltipTitle={`You owned ${owned} of the ${total} sets in our database (${formatPercentage(percentageOwned)})${idToken ? `. You have spend ${formatFrEuroCurrency(totalBought)} on your collection. The store value of your collection is ${formatFrEuroCurrency(totalStoreValue)} and the market value ${formatFrEuroCurrency(totalMarketValue)}` : ''}`}
      />
      <AgGridTable
        columnDefs={setsColumnDefs}
        defaultColDef={defaultSetsColumnDefs}
        quickFilterText={quickFilter}
        rowData={data}
      />
      <Outlet />
    </>
  )
}

export default Sets
