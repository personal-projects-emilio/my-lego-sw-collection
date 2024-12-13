import { useMemo } from 'react'
import { MdLocalSee } from 'react-icons/md'

import type { ColDef } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderProps,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  listValueFormatter,
  OverflowTypographyCellRenderer,
} from 'components/AgGrid/column'
import { useAuth } from 'providers'
import type { Set } from 'types/sets'
import { spreadArrayIf } from 'utils/array'
import { formatFrEuroCurrency } from 'utils/format'

import { SetMinifigsCellRenderer } from './components'

const useSetsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { idToken } = useAuth()
  return useMemo(
    () =>
      [
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <MdLocalSee />,
            variant: 'set',
          } satisfies ItemIdCellRenderProps,
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
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'subtheme',
          flex: 1,
          headerName: 'Subtheme',
          minWidth: 120,
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
          field: 'releaseYear',
          width: 80,
          headerName: 'Release',
        },
        {
          field: 'content.partsQuantity',
          width: 100,
          filter: 'agNumberColumnFilter',
          suppressFloatingFilterButton: false,
          headerName: 'Parts Qty',
        },
        {
          cellClass: [agGridClasses.flexAlignCenter],
          cellRenderer: SetMinifigsCellRenderer,
          field: 'content.minifigs',
          filter: false,
          headerName: 'Minifigs',
          width: 100,
        },
        ...spreadArrayIf<ColDef<Set>>(idToken !== undefined, [
          {
            field: 'prices.bought',
            filter: 'agNumberColumnFilter',
            headerName: 'Bought',
            suppressFloatingFilterButton: false,
            valueFormatter: ({ value }) => formatFrEuroCurrency(value),
            width: 100,
          },
          {
            field: 'prices.marketValue',
            width: 100,
            filter: 'agNumberColumnFilter',
            suppressFloatingFilterButton: false,
            headerName: 'Market Value',
            valueFormatter: ({ value }) => formatFrEuroCurrency(value),
          },
          {
            field: 'prices.storeValue',
            width: 100,
            filter: 'agNumberColumnFilter',
            suppressFloatingFilterButton: false,
            headerName: 'Store Value',
            valueFormatter: ({ value }) => formatFrEuroCurrency(value),
          },
        ]),
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ExternalLinksCellRenderer,
          cellRendererParams: {
            variant: 'set',
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
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'location',
          headerName: 'Location',
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'note',
          headerName: 'Notes',
        },
        {
          field: 'possessed',
          headerName: 'Possessed',
          suppressFloatingFilterButton: false,
          width: 120,
        },
        {
          field: 'ownedQuantity',
          width: 100,
          headerName: 'Owned Quantity',
        },
        {
          field: 'content.bags',
          width: 100,
          headerName: 'Bags',
        },
        {
          field: 'content.box',
          width: 100,
          headerName: 'Box',
        },
        {
          field: 'content.notice',
          width: 100,
          headerName: 'Notice',
        },
      ] as const satisfies Array<ColDef<Set>>,
    [agGridClasses, idToken]
  )
}

export default useSetsColDefs
