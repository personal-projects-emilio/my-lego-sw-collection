import { type FC, useDeferredValue, useMemo, useState } from 'react'

import { Skeleton } from '@mui/material'
import { Navigate, Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { useCollection } from 'hooks'
import { defaultMinifigsColumnDefs } from 'pages/Minifigs/Minifigs.constants'
import { useAuth } from 'providers/AuthProvider'

import useLooseMinifigsColDefs from './useLooseMinifigsColDefs'

const LooseMinifigs: FC = () => {
  const { idToken } = useAuth()
  const { minifigsList, isLoading } = useCollection()
  const columnDefs = useLooseMinifigsColDefs()
  const [quickFilter, setQuickFilter] = useState('')
  const deferredQuickFilter = useDeferredValue(quickFilter)

  const looseMinifigs = useMemo(
    () => minifigsList?.filter(({ owned }) => owned.loose.quantity > 0),
    [minifigsList]
  )

  if (!idToken) return <Navigate to="/minifigs" />

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader
        addLabel="Add loose minifig"
        addTo="/loose-minifigs/add"
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
      />
      <AgGridTable
        columnLayoutId="looseMinifigs"
        columnDefs={columnDefs}
        defaultColDef={defaultMinifigsColumnDefs}
        getRowId={({ data }) => data.id}
        quickFilterText={deferredQuickFilter}
        rowData={looseMinifigs}
      />
      <Outlet />
    </>
  )
}

export default LooseMinifigs
