import { useMemo } from 'react'
import { FaBoxOpen } from 'react-icons/fa6'

import type { ColDef } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  ItemActionsCellRenderer,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  OverflowTypographyCellRenderer,
  type ResaleSetActionsCellRendererProps,
} from 'components/AgGrid/column'
import type { ResaleSet } from 'types/resale'
import {
  formatFrDate,
  formatFrEuroCurrency,
  formatPercentage,
} from 'utils/format'
import { type getResaleValues, isSetRetired } from 'utils/lego'

import useResaleSetsMutations from './useResaleSetsMutations'

export type ResaleSetRow = ResaleSet & ReturnType<typeof getResaleValues>

const euroColDef = {
  cellDataType: 'number',
  filter: 'agNumberColumnFilter',
  suppressFloatingFilterButton: false,
  valueFormatter: ({ value }) =>
    value === null || value === undefined ? '' : formatFrEuroCurrency(value),
  width: 140,
} as const satisfies ColDef<ResaleSetRow>

const percentColDef = {
  ...euroColDef,
  valueFormatter: ({ value }) =>
    value === null || value === undefined
      ? ''
      : formatPercentage(Math.round(value * 100) / 100),
  width: 120,
} as const satisfies ColDef<ResaleSetRow>

const numberColDef = {
  cellDataType: 'number',
  filter: 'agNumberColumnFilter',
  suppressFloatingFilterButton: false,
  width: 110,
} as const satisfies ColDef<ResaleSetRow>

const useResaleSetsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { deleteResaleSet, isPending } = useResaleSetsMutations()

  return useMemo(
    () =>
      [
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellDataType: false,
          cellRendererSelector: ({ node }) =>
            node.rowPinned
              ? undefined
              : {
                  component: ItemIdCellRenderer,
                  params: {
                    icon: <FaBoxOpen />,
                    variant: 'set',
                  } satisfies ItemIdCellRenderProps,
                },
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
          minWidth: 150,
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'frenchName',
          headerName: 'French name',
          width: 150,
        },
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellDataType: false,
          cellRendererSelector: ({ node }) =>
            node.rowPinned
              ? undefined
              : {
                  component: ItemActionsCellRenderer,
                  params: {
                    deleteItem: deleteResaleSet,
                    isPending,
                    variant: 'resale',
                  } satisfies ResaleSetActionsCellRendererProps,
                },
          colId: 'actions',
          filter: false,
          floatingFilter: false,
          headerName: 'Actions',
          resizable: false,
          sortable: false,
          valueGetter: ({ data, node }) => (node?.rowPinned ? null : data?.id),
          width: 110,
        },
        {
          colId: 'retired',
          headerName: 'Retired',
          valueGetter: ({ data, node }) =>
            node?.rowPinned || !data ? null : isSetRetired(data),
          width: 100,
        },
        { ...numberColDef, field: 'quantityBought', headerName: 'Qty bought' },
        { ...euroColDef, field: 'officialPrice', headerName: 'Official' },
        { ...euroColDef, field: 'unitBoughtPrice', headerName: 'Unit bought' },
        { ...percentColDef, field: 'discount', headerName: 'Discount' },
        { ...numberColDef, field: 'quantitySold', headerName: 'Qty sold' },
        {
          ...euroColDef,
          field: 'unitSellingPrice',
          headerName: 'Unit selling',
        },
        { ...euroColDef, field: 'unitProfit', headerName: 'Unit profit' },
        { ...percentColDef, field: 'profitPercentage', headerName: 'Profit %' },
        { ...euroColDef, field: 'totalSold', headerName: 'Total sold' },
        { ...euroColDef, field: 'totalProfit', headerName: 'Total profit' },
        { field: 'setCondition', headerName: 'Set', width: 110 },
        { field: 'boxCondition', headerName: 'Box', width: 110 },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'location',
          headerName: 'Location',
          width: 140,
        },
        {
          field: 'exitDate',
          headerName: 'Exit date',
          valueFormatter: ({ value }) => formatFrDate(value ?? null),
          width: 120,
        },
      ] as const satisfies Array<ColDef<ResaleSetRow>>,
    [agGridClasses, deleteResaleSet, isPending]
  )
}

export default useResaleSetsColDefs
