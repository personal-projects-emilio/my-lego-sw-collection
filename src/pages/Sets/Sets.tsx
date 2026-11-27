import type { FC } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import { ColumnFilterContext } from 'components/AgGrid/table/columnFilterContext'
import { useCollection } from 'hooks'

import { useSetsColDefs } from './hooks'
import SetsFilterPrototype from './prototype/SetsFilterPrototype'
import useSetsFilterPrototype from './prototype/useSetsFilterPrototype'
import { defaultSetsColumnDefs } from './Sets.constants'

const prototypeDefaultColDef = {
  ...defaultSetsColumnDefs,
  filter: false,
  floatingFilter: false,
}

const Sets: FC = () => {
  const { setsList, isLoading } = useCollection()
  const setsColumnDefs = useSetsColDefs()
  const {
    columnFilterActions,
    doesExternalFilterPass,
    isExternalFilterPresent,
    ...prototype
  } = useSetsFilterPrototype(setsList)

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <ColumnFilterContext.Provider value={columnFilterActions}>
      <SetsFilterPrototype {...prototype} />
      <AgGridTable
        columnLayoutId="sets"
        columnDefs={setsColumnDefs}
        defaultColDef={prototypeDefaultColDef}
        doesExternalFilterPass={doesExternalFilterPass}
        isExternalFilterPresent={isExternalFilterPresent}
        rowData={setsList}
      />
      <Outlet />
    </ColumnFilterContext.Provider>
  )
}

export default Sets
