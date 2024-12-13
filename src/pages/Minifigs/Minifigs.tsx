import type { FC } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { useMinifigsQuery } from 'api/minifigs'
import { AgGridTable } from 'components/AgGrid/table'

import { defaultMinifigsColumnDefs } from './Minifigs.constants'
import useMinifigsColDefs from './useMinifigsColDefs'

const Minifigs: FC = () => {
  const { data: minifigsList, isLoading } = useMinifigsQuery()
  const minifigsColumnDefs = useMinifigsColDefs()
  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <AgGridTable
        columnDefs={minifigsColumnDefs}
        defaultColDef={defaultMinifigsColumnDefs}
        rowData={structuredClone(minifigsList)}
      />
      <Outlet />
    </>
  )
}

export default Minifigs
