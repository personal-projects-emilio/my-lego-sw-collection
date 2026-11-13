import { useMemo } from 'react'
import { PiLegoSmiley } from 'react-icons/pi'

import type { ColDef, GetQuickFilterTextParams } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderProps,
  ItemActionsCellRenderer,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  listValueFormatter,
  type MinifigActionsCellRendererProps,
  OverflowTypographyCellRenderer,
} from 'components/AgGrid/column'
import type { CollectionMinifig } from 'types/minifigs'

import { OwnedCellRenderer } from '../components'
import useMinifigsMutations from './useMinifigsMutations'

const useMinifigsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { deleteMinifig, isPending } = useMinifigsMutations()

  return useMemo(
    () =>
      [
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <PiLegoSmiley />,
            variant: 'minifig',
          } satisfies ItemIdCellRenderProps,
          field: 'id',
          headerName: 'Id',
          initialSort: 'asc',
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
          filter: 'agNumberColumnFilter',
          filterValueGetter: ({ data }) => data?.owned.total,
          suppressFloatingFilterButton: false,
          width: 100,
          getQuickFilterText: ({
            data: { owned },
          }: GetQuickFilterTextParams<CollectionMinifig>) =>
            (owned.inSet ?? []).reduce(
              (quickFilterText, { setId }) => `${quickFilterText}, ${setId}`,
              owned.loose?.quantity > 0 ? 'loose' : ''
            ),
        },
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ExternalLinksCellRenderer,
          cellRendererParams: {
            variant: 'minifig',
          } satisfies ExternalLinksCellRenderProps,
          colId: 'externalLinks',
          field: 'id',
          filter: false,
          floatingFilter: false,
          headerName: 'Links',
          resizable: false,
          sortable: false,
          width: 100,
        },
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemActionsCellRenderer,
          cellRendererParams: {
            deleteItem: deleteMinifig,
            isPending,
            variant: 'minifig',
          } satisfies MinifigActionsCellRendererProps,
          colId: 'actions',
          field: 'id',
          filter: false,
          floatingFilter: false,
          headerName: 'Actions',
          resizable: false,
          sortable: false,
          width: 140,
        },
      ] as const satisfies Array<ColDef<CollectionMinifig>>,
    [agGridClasses, deleteMinifig, isPending]
  )
}

export default useMinifigsColDefs
