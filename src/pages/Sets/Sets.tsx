import type { FC } from 'react'

import { Skeleton } from '@mui/material'
import { useSetsQuery } from 'api/sets'
import { AgGridTable } from 'components/AgGrid/table'

import { defaultSetsColumnDefs } from './Sets.constants'
import useSetsColDefs from './useSetsColDefs'

const Sets: FC = () => {
  const { data, isLoading } = useSetsQuery()
  const setsColumnDefs = useSetsColDefs()

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <AgGridTable
      columnDefs={setsColumnDefs}
      defaultColDef={defaultSetsColumnDefs}
      rowData={data}
    />
  )
}

export default Sets
