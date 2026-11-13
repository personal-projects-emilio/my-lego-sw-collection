import { useMemo } from 'react'
import { FaPerson } from 'react-icons/fa6'

import type { ColDef, ValueSetterParams } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderProps,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  OverflowTypographyCellRenderer,
} from 'components/AgGrid/column'
import type { CollectionMinifig, LooseMinifig } from 'types/minifigs'
import { formatFrEuroCurrency } from 'utils/format'

import useLooseMinifigsMutations from './useLooseMinifigsMutations'

type LooseField = Exclude<keyof LooseMinifig, 'isInFrame'>

const euroColDef = {
  cellDataType: 'number',
  filter: 'agNumberColumnFilter',
  suppressFloatingFilterButton: false,
  valueFormatter: ({ value }) => formatFrEuroCurrency(value ?? 0),
  width: 150,
} as const satisfies ColDef<CollectionMinifig>

const useLooseMinifigsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { editLooseMinifig } = useLooseMinifigsMutations()

  return useMemo(() => {
    const looseValueSetter =
      (field: LooseField) =>
      ({ data, newValue }: ValueSetterParams<CollectionMinifig>) => {
        const value = Math.max(0, Number(newValue) || 0)
        editLooseMinifig(data.id, {
          [field]: field === 'quantity' ? Math.round(value) : value,
        })
        return false
      }

    return [
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
        cellDataType: 'number',
        cellEditorParams: { min: 0, precision: 0 },
        editable: true,
        field: 'owned.loose.quantity',
        filter: 'agNumberColumnFilter',
        headerName: 'Loose qty',
        suppressFloatingFilterButton: false,
        valueSetter: looseValueSetter('quantity'),
        width: 120,
      },
      {
        ...euroColDef,
        cellEditorParams: { min: 0 },
        editable: true,
        field: 'owned.loose.unitBoughtPrice',
        headerName: 'Unit bought',
        valueSetter: looseValueSetter('unitBoughtPrice'),
      },
      {
        ...euroColDef,
        cellEditorParams: { min: 0 },
        editable: true,
        field: 'owned.loose.unitMarketValue',
        headerName: 'Unit market value',
        valueSetter: looseValueSetter('unitMarketValue'),
      },
      {
        ...euroColDef,
        colId: 'totalBought',
        headerName: 'Total bought',
        valueGetter: ({ data }) =>
          data
            ? data.owned.loose.quantity * data.owned.loose.unitBoughtPrice
            : 0,
      },
      {
        ...euroColDef,
        colId: 'totalMarketValue',
        headerName: 'Total market value',
        valueGetter: ({ data }) =>
          data
            ? data.owned.loose.quantity * data.owned.loose.unitMarketValue
            : 0,
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
    ] as const satisfies Array<ColDef<CollectionMinifig>>
  }, [agGridClasses, editLooseMinifig])
}

export default useLooseMinifigsColDefs
