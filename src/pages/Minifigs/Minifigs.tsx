import { type FC, useDeferredValue, useState } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { useCollection } from 'hooks'
import { getColumnTotals } from 'utils/totalRow'

import { useMinifigsColDefs } from './hooks'
import {
  defaultMinifigsColumnDefs,
  minifigsTotalColumns,
} from './Minifigs.constants'

const Minifigs: FC = () => {
  const { minifigsList, isLoading } = useCollection()
  const minifigsColumnDefs = useMinifigsColDefs()
  const [quickFilter, setQuickFilter] = useState('')
  const deferredQuickFilter = useDeferredValue(quickFilter)

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader
        addTo="/minifigs/add"
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
      />
      <AgGridTable
        columnLayoutId="minifigs"
        columnDefs={minifigsColumnDefs}
        defaultColDef={defaultMinifigsColumnDefs}
        getTotalRow={(params) =>
          getColumnTotals({ ...params, totalColumns: minifigsTotalColumns })
        }
        quickFilterText={deferredQuickFilter}
        rowData={structuredClone(minifigsList)}
      />
      <Outlet />
    </>
  )
}

export default Minifigs
