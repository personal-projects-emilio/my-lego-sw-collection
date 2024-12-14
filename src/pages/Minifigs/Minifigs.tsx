import { type FC, useState } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { useMinifigsQuery } from 'api/minifigs'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader'
import { formatPercentage } from 'utils/format'

import { useMinifigsColDefs, useMinifigsStatistics } from './hooks'
import { defaultMinifigsColumnDefs } from './Minifigs.constants'

const Minifigs: FC = () => {
  const { data: minifigsList, isLoading } = useMinifigsQuery()
  const minifigsColumnDefs = useMinifigsColDefs()
  const [quickFilter, setQuickFilter] = useState('')
  const { percentageVariantsOwned, totalOwned, totalVariants, variantsOwned } =
    useMinifigsStatistics()

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader
        addTo="/minifigs/add"
        setQuickFilter={setQuickFilter}
        statisticsTooltipTitle={`You owned ${variantsOwned} of the ${totalVariants} minifig variants in our database (${formatPercentage(percentageVariantsOwned)}). The total of minifigs you owned is ${totalOwned}`}
      />
      <AgGridTable
        columnDefs={minifigsColumnDefs}
        defaultColDef={defaultMinifigsColumnDefs}
        quickFilterText={quickFilter}
        rowData={structuredClone(minifigsList)}
      />
      <Outlet />
    </>
  )
}

export default Minifigs
