import { FC } from 'react'

import { Skeleton } from '@mui/material'
import { useMinifigsQuery } from 'api/minifigs'
import { AgGridTable } from 'components/AgGrid/table'

import { defaultMinifigsColumnDefs } from './Minifigs.constants'
import useMinifigsColDefs from './useMinifigsColDefs'

export const Minifigs: FC = () => {
  const { data, isLoading } = useMinifigsQuery()
  const minifigsColumnDefs = useMinifigsColDefs()

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <AgGridTable
      columnDefs={minifigsColumnDefs}
      defaultColDef={defaultMinifigsColumnDefs}
      rowData={data}
    />
  )
}

export default Minifigs
