import { useMemo } from 'react'
import { PiLego } from 'react-icons/pi'

import type { ColDef } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  buildActionsColDef,
  ItemActionsCellRenderer,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  numberColDef,
  OverflowTypographyCellRenderer,
  type ResaleSetActionsCellRendererProps,
} from 'components/AgGrid/column'
import capitalize from 'lodash/capitalize'
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

const quantityColDef = {
  ...numberColDef,
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
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <PiLego />,
            variant: 'set',
          } satisfies ItemIdCellRenderProps,
          field: 'id',
          headerName: 'Id',
          initialPinned: 'left',
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
        buildActionsColDef<ResaleSetRow>({
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellDataType: false,
          cellRenderer: ItemActionsCellRenderer,
          cellRendererParams: {
            deleteItem: deleteResaleSet,
            isPending,
            variant: 'resale',
          } satisfies ResaleSetActionsCellRendererProps,
          field: 'id',
          width: 110,
        }),
        {
          cellDataType: 'boolean',
          colId: 'retired',
          headerName: 'Retired',
          valueGetter: ({ data }) => (data ? isSetRetired(data) : null),
          width: 110,
        },
        {
          ...quantityColDef,
          field: 'quantityBought',
          headerName: 'Qty bought',
        },
        { ...euroColDef, field: 'officialPrice', headerName: 'Official' },
        { ...euroColDef, field: 'unitBoughtPrice', headerName: 'Unit bought' },
        { ...percentColDef, field: 'discount', headerName: 'Discount' },
        { ...euroColDef, field: 'totalBought', headerName: 'Total bought' },
        { ...quantityColDef, field: 'quantitySold', headerName: 'Qty sold' },
        {
          ...euroColDef,
          field: 'unitSellingPrice',
          headerName: 'Unit selling',
        },
        { ...euroColDef, field: 'unitProfit', headerName: 'Unit profit' },
        { ...percentColDef, field: 'profitPercentage', headerName: 'Profit %' },
        { ...euroColDef, field: 'totalSold', headerName: 'Total sold' },
        { ...euroColDef, field: 'totalProfit', headerName: 'Total profit' },
        {
          field: 'setCondition',
          headerName: 'Set',
          valueFormatter: ({ value }) => capitalize(value ?? ''),
          width: 110,
        },
        {
          field: 'boxCondition',
          headerName: 'Box',
          valueFormatter: ({ value }) => capitalize(value ?? ''),
          width: 110,
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'location',
          headerName: 'Location',
          width: 140,
        },
        {
          cellDataType: 'dateString',
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
