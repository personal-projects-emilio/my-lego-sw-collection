import { useMemo } from 'react'
import { MdLocalSee } from 'react-icons/md'

import type { ColDef, GetQuickFilterTextParams } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderProps,
  ItemActionsCellRenderer,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  listValueFormatter,
  OverflowTypographyCellRenderer,
  type SetActionsCellRendererProps,
} from 'components/AgGrid/column'
import { useAuth } from 'providers'
import type { Set } from 'types/sets'
import { spreadArrayIf } from 'utils/array'
import { formatFrEuroCurrency } from 'utils/format'

import { SetMinifigsCellRenderer } from '../components'
import useSetsMutations from './useSetsMutations'

const useSetsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { deleteSet, isPending } = useSetsMutations()
  const { idToken } = useAuth()
  return useMemo(
    () =>
      [
        {
          field: 'id',
          headerName: 'Id',
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <MdLocalSee />,
            variant: 'set',
          } satisfies ItemIdCellRenderProps,
          sort: 'asc',
          width: 120,
        },
        {
          field: 'name',
          headerName: 'Name',
          cellRenderer: OverflowTypographyCellRenderer,
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'subtheme',
          headerName: 'Subtheme',
          cellRenderer: OverflowTypographyCellRenderer,
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'tags',
          headerName: 'Tags',
          cellRenderer: OverflowTypographyCellRenderer,
          flex: 1,
          minWidth: 120,
          valueFormatter: ({ value }) => listValueFormatter(value),
        },
        {
          field: 'timelines',
          headerName: 'Timelines',
          cellRenderer: OverflowTypographyCellRenderer,
          flex: 1,
          minWidth: 120,
          valueFormatter: ({ value }) => listValueFormatter(value),
        },
        {
          field: 'appearances',
          headerName: 'Appearances',
          cellRenderer: OverflowTypographyCellRenderer,
          flex: 1,
          minWidth: 120,
          valueFormatter: ({ value }) => listValueFormatter(value),
        },
        {
          field: 'releaseYear',
          headerName: 'Release',
          width: 80,
        },
        {
          field: 'content.partsQuantity',
          headerName: 'Parts Qty',
          filter: 'agNumberColumnFilter',
          suppressFloatingFilterButton: false,
          width: 100,
        },
        {
          field: 'content.minifigs',
          headerName: 'Minifigs',
          cellClass: [agGridClasses.flexAlignCenter],
          cellRenderer: SetMinifigsCellRenderer,
          filter: false,
          getQuickFilterText: ({
            data: {
              content: { minifigs },
            },
          }: GetQuickFilterTextParams<Set>) =>
            (minifigs ?? []).reduce(
              (quickFilterText, minifig) =>
                `${quickFilterText}, ${minifig.id}, ${minifig.characterName}`,
              ''
            ),
          width: 100,
        },
        ...spreadArrayIf<ColDef<Set>>(idToken !== undefined, [
          {
            field: 'prices.bought',
            headerName: 'Bought',
            filter: 'agNumberColumnFilter',
            suppressFloatingFilterButton: false,
            valueFormatter: ({ value }) => formatFrEuroCurrency(value),
            width: 100,
          },
          {
            field: 'prices.marketValue',
            headerName: 'Market Value',
            filter: 'agNumberColumnFilter',
            suppressFloatingFilterButton: false,
            valueFormatter: ({ value }) => formatFrEuroCurrency(value),
            width: 100,
          },
          {
            field: 'prices.storeValue',
            headerName: 'Store Value',
            filter: 'agNumberColumnFilter',
            suppressFloatingFilterButton: false,
            valueFormatter: ({ value }) => formatFrEuroCurrency(value),
            width: 100,
          },
        ]),
        {
          colId: 'externalLinks',
          field: 'id',
          headerName: 'Links',
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ExternalLinksCellRenderer,
          cellRendererParams: {
            variant: 'set',
          } satisfies ExternalLinksCellRenderProps,
          filter: false,
          floatingFilter: false,
          resizable: false,
          sortable: false,
          width: 100,
        },
        {
          colId: 'actions',
          field: 'id',
          headerName: 'Actions',
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemActionsCellRenderer,
          cellRendererParams: {
            deleteItem: deleteSet,
            isPending,
            variant: 'set',
          } satisfies SetActionsCellRendererProps,
          filter: false,
          floatingFilter: false,
          resizable: false,
          sortable: false,
          width: 140,
        },
        {
          field: 'location',
          headerName: 'Location',
          cellRenderer: OverflowTypographyCellRenderer,
        },
        {
          field: 'note',
          headerName: 'Notes',
          cellRenderer: OverflowTypographyCellRenderer,
        },
        {
          field: 'possessed',
          headerName: 'Possessed',
          suppressFloatingFilterButton: false,
          width: 120,
        },
        {
          field: 'ownedQuantity',
          headerName: 'Owned Quantity',
          width: 100,
        },
        {
          field: 'content.bags',
          headerName: 'Bags',
          cellRenderer: 'agCheckboxCellRenderer',
          width: 100,
        },
        {
          field: 'content.box',
          headerName: 'Box',
          cellRenderer: 'agCheckboxCellRenderer',
          width: 100,
        },
        {
          field: 'content.notice',
          headerName: 'Notice',
          cellRenderer: 'agCheckboxCellRenderer',
          width: 100,
        },
      ] as const satisfies Array<ColDef<Set>>,
    [agGridClasses, deleteSet, idToken, isPending]
  )
}

export default useSetsColDefs
