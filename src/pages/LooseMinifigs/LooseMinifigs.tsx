import { type FC, useMemo } from 'react'

import { Skeleton } from '@mui/material'
import { Navigate } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import { useCollection } from 'hooks'
import { defaultMinifigsColumnDefs } from 'pages/Minifigs/Minifigs.constants'
import { useAuth } from 'providers/AuthProvider'

import useLooseMinifigsColDefs from './useLooseMinifigsColDefs'

const LooseMinifigs: FC = () => {
  const { idToken } = useAuth()
  const { minifigsList, isLoading } = useCollection()
  const columnDefs = useLooseMinifigsColDefs()

  const looseMinifigs = useMemo(
    () => minifigsList?.filter(({ owned }) => owned.loose.quantity > 0),
    [minifigsList]
  )

  if (!idToken) return <Navigate to="/minifigs" />

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <AgGridTable
      columnDefs={columnDefs}
      defaultColDef={defaultMinifigsColumnDefs}
      getRowId={({ data }) => data.id}
      rowData={looseMinifigs}
    />
  )
}

export default LooseMinifigs
