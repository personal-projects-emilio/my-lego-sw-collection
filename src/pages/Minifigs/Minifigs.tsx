import type { FC } from 'react'

import { Skeleton } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { AgGridTable } from 'components/AgGrid/table'
import { ItemsFilterBar, useItemsFilter } from 'components/ItemsFilter'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { useCollection } from 'hooks'

import { useMinifigsColDefs, useMinifigsFilterConfig } from './hooks'
import { defaultMinifigsColumnDefs } from './Minifigs.constants'

const Minifigs: FC = () => {
  const { minifigsList, isLoading } = useCollection()
  const minifigsColumnDefs = useMinifigsColDefs()
  const minifigsFilterConfig = useMinifigsFilterConfig()
  const itemsFilter = useItemsFilter({
    columnLayoutId: 'minifigs',
    config: minifigsFilterConfig,
    items: minifigsList,
  })

  if (isLoading)
    return <Skeleton variant="rectangular" height="calc(100vh - 48px)" />

  return (
    <>
      <ModuleHeader addLabel="Add minifig" addTo="/minifigs/add">
        <ItemsFilterBar {...itemsFilter.barProps} />
      </ModuleHeader>
      <AgGridTable
        columnLayoutId="minifigs"
        columnDefs={minifigsColumnDefs}
        defaultColDef={defaultMinifigsColumnDefs}
        {...itemsFilter.gridProps}
        rowData={structuredClone(minifigsList)}
      />
      <Outlet />
    </>
  )
}

export default Minifigs
