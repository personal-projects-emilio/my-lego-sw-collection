import type { FC } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import { ItemsFilterBar, useItemsFilter } from 'components/ItemsFilter'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { useCollection } from 'hooks'

import { useSetsColDefs } from './hooks'
import { defaultSetsColumnDefs } from './Sets.constants'
import { setsFilterConfig } from './setsFilterConfig'

const Sets: FC = () => {
  const { setsList, isLoading } = useCollection()
  const setsColumnDefs = useSetsColDefs()
  const itemsFilter = useItemsFilter({
    config: setsFilterConfig,
    items: setsList,
  })

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader addLabel="Add set" addTo="/sets/add">
        <ItemsFilterBar {...itemsFilter.barProps} />
      </ModuleHeader>
      <AgGridTable
        columnLayoutId="sets"
        columnDefs={setsColumnDefs}
        defaultColDef={defaultSetsColumnDefs}
        {...itemsFilter.gridProps}
        rowData={setsList}
      />
      <Outlet />
    </>
  )
}

export default Sets
