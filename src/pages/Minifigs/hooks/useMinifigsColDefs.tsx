import { useMemo } from 'react'
import { FaPerson } from 'react-icons/fa6'

import type { ColDef, GetQuickFilterTextParams } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderProps,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  listValueFormatter,
  OverflowTypographyCellRenderer,
} from 'components/AgGrid/column'
import type { Minifig } from 'types/minifigs'

import {
  MinifigActionsCellRenderer,
  type MinifigActionsCellRendererProps,
  OwnedCellRenderer,
} from '../components'
import useMinifigsMutations from './useMinifigsMutations'

const useMinifigsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { deleteMinifig, isPending, toggleMinifigPossession } =
    useMinifigsMutations()

  return useMemo(
    () =>
      [
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <FaPerson />,
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
          field: 'possessed',
          headerName: 'Possessed',
          editable: true,
          suppressFloatingFilterButton: false,
          valueSetter: ({ api, column, data, node }) => {
            toggleMinifigPossession(data.id).then(() =>
              api.refreshCells({
                columns: [column],
                rowNodes: node ? [node] : undefined,
              })
            )
            return false
          },
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
          getQuickFilterText: ({
            data: { owned },
          }: GetQuickFilterTextParams<Minifig>) =>
            `${owned.inSet?.map((el) => el.setId).join(', ')}${owned.loose?.quantity > 0 ? ' loose' : ''}`,
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
          cellRenderer: MinifigActionsCellRenderer,
          cellRendererParams: {
            deleteMinifig,
            isPending,
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
      ] as const satisfies Array<ColDef<Minifig>>,
    [agGridClasses, deleteMinifig, isPending, toggleMinifigPossession]
  )
}

export default useMinifigsColDefs
