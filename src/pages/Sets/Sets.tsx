import { type FC, useDeferredValue, useState } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { useCollection } from 'hooks'

import { useSetsColDefs } from './hooks'
import { defaultSetsColumnDefs, mapSetColIdsToTotals } from './Sets.constants'

const Sets: FC = () => {
  const { setsList, isLoading } = useCollection()
  const setsColumnDefs = useSetsColDefs()
  const [quickFilter, setQuickFilter] = useState('')
  const deferredQuickFilter = useDeferredValue(quickFilter)

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader
        addTo="/sets/add"
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
      />
      <AgGridTable
        columnLayoutId="sets"
        columnDefs={setsColumnDefs}
        defaultColDef={defaultSetsColumnDefs}
        mapColIdsToTotals={mapSetColIdsToTotals}
        quickFilterText={deferredQuickFilter}
        rowData={setsList}
      />
      <Outlet />
    </>
  )
}

export default Sets
