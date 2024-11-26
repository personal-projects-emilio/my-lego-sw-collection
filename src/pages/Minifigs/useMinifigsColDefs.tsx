import { useMemo } from 'react'
import { FaPerson } from 'react-icons/fa6'

import type { ColDef } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderParams,
  ItemIdCellRenderer,
  type ItemIdCellRenderParams,
  listValueFormatter,
  OverflowTypographyCellRenderer,
} from 'components/AgGrid/column'
import type { Minifig } from 'types/minifigs'

import { OwnedCellRenderer } from './components'

const useMinifigsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  return useMemo(
    () =>
      [
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <FaPerson />,
            variant: 'minifig',
          } satisfies ItemIdCellRenderParams,
          field: 'id',
          headerName: 'Id',
          sort: 'asc',
          width: 120,
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'name',
          flex: 1,
          headerName: 'Name',
          minWidth: 120,
        },
        {
          field: 'characterName',
          headerName: 'Character Name',
        },
        {
          field: 'possessed',
          headerName: 'Possessed',
          suppressFloatingFilterButton: false,
          width: 120,
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'tags',
          flex: 1,
          headerName: 'Tags',
          minWidth: 120,
          valueFormatter: ({ value }) => listValueFormatter(value),
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'timelines',
          flex: 1,
          headerName: 'Timelines',
          minWidth: 120,
          valueFormatter: ({ value }) => listValueFormatter(value),
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'appearances',
          flex: 1,
          headerName: 'Appearances',
          minWidth: 120,
          valueFormatter: ({ value }) => listValueFormatter(value),
        },
        {
          cellClass: agGridClasses.flexAlignCenter,
          cellRenderer: OwnedCellRenderer,
          field: 'owned',
          headerName: 'Owned',
          resizable: false,
          valueFormatter: ({ value }) => value.total,
          width: 70,
        },
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ExternalLinksCellRenderer,
          cellRendererParams: {
            variant: 'minifig',
          } satisfies ExternalLinksCellRenderParams,
          colId: 'externalLinks',
          field: 'id',
          filter: false,
          floatingFilter: false,
          headerName: 'Links',
          resizable: false,
          sortable: false,
          width: 100,
        },
      ] as const satisfies Array<ColDef<Minifig>>,
    [agGridClasses]
  )
}

export default useMinifigsColDefs
