import { useMemo } from 'react'
import { PiLego } from 'react-icons/pi'

import type {
  ColDef,
  GetQuickFilterTextParams,
  ValueFormatterParams,
} from 'ag-grid-community'
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
  tagsColDef,
} from 'components/AgGrid/column'
import useVocabulary from 'hooks/useVocabulary'
import { useAuth } from 'providers/AuthProvider'
import type { CollectionSet } from 'types/sets'
import { compareIds, spreadArrayIf } from 'utils/array'
import { formatFrDate, formatFrEuroCurrency } from 'utils/format'
import { isSetRetired } from 'utils/lego'

import { SetMinifigsCellRenderer } from '../components'
import useSetsMutations from './useSetsMutations'

const useSetsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { deleteSet, isPending } = useSetsMutations()
  const { idToken } = useAuth()
  const vocabulary = useVocabulary()
  return useMemo(
    () =>
      [
        {
          field: 'id',
          headerName: 'Id',
          cellDataType: 'text',
          comparator: compareIds,
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <PiLego />,
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
        tagsColDef<CollectionSet>(vocabulary, 'sets'),
        {
          field: 'releaseYear',
          headerName: 'Release',
          width: 80,
        },
        {
          field: 'exitDate',
          headerName: 'Exit date',
          cellDataType: 'dateString',
          filter: 'agDateColumnFilter',
          suppressFloatingFilterButton: false,
          valueFormatter: ({ value }) => formatFrDate(value),
          width: 130,
        },
        {
          colId: 'retired',
          headerName: 'Retired',
          cellDataType: 'boolean',
          valueGetter: ({ data }) => (data ? isSetRetired(data) : false),
          suppressFloatingFilterButton: false,
          width: 110,
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
          valueFormatter: ({
            value,
          }: ValueFormatterParams<
            CollectionSet,
            CollectionSet['content']['minifigs']
          >) =>
            listValueFormatter(
              value?.map(({ id, quantity }) => `${id}: ${quantity}`)
            ),
          cellClass: [agGridClasses.flexAlignCenter],
          cellRenderer: SetMinifigsCellRenderer,
          filter: false,
          getQuickFilterText: ({
            data: {
              content: { minifigs },
            },
          }: GetQuickFilterTextParams<CollectionSet>) =>
            (minifigs ?? []).reduce(
              (quickFilterText, minifig) =>
                `${quickFilterText}, ${minifig.id}, ${minifig.characterName}`,
              ''
            ),
          width: 100,
        },
        ...spreadArrayIf<ColDef<CollectionSet>>(idToken !== undefined, [
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
          field: 'ownedQuantity',
          headerName: 'Owned Quantity',
          filter: 'agNumberColumnFilter',
          suppressFloatingFilterButton: false,
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
      ] as const satisfies Array<ColDef<CollectionSet>>,
    [agGridClasses, deleteSet, idToken, isPending, vocabulary]
  )
}

export default useSetsColDefs
