import { useMemo } from 'react'
import { PiLegoSmiley } from 'react-icons/pi'

import type { ColDef, ValueSetterParams } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  buildTotalContext,
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderProps,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  numberColDef,
  OverflowTypographyCellRenderer,
} from 'components/AgGrid/column'
import type { CollectionMinifig, LooseMinifig } from 'types/minifigs'
import { formatFrEuroCurrency } from 'utils/format'

import useLooseMinifigsMutations from './useLooseMinifigsMutations'

type LooseField = Exclude<keyof LooseMinifig, 'isInFrame'>

const euroColDef = {
  cellDataType: 'number',
  valueFormatter: ({ value }) => formatFrEuroCurrency(value ?? 0),
  width: 150,
} as const satisfies ColDef<CollectionMinifig>

const getLooseQuantity = ({ owned }: CollectionMinifig) => owned.loose.quantity

const looseSumContext = buildTotalContext({ aggregation: 'sum' })

const unitPriceContext = buildTotalContext<CollectionMinifig>({
  aggregation: 'weightedAverage',
  getWeight: getLooseQuantity,
})

const useLooseMinifigsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { editLooseMinifig } = useLooseMinifigsMutations()

  return useMemo(() => {
    const createLooseValueSetter =
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
          icon: <PiLegoSmiley />,
          variant: 'minifig',
        } satisfies ItemIdCellRenderProps,
        context: buildTotalContext({ aggregation: 'count' }),
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
        minWidth: 120,
      },
      {
        ...numberColDef,
        cellEditorParams: { min: 0, precision: 0 },
        editable: true,
        context: looseSumContext,
        field: 'owned.loose.quantity',
        headerName: 'Loose qty',
        valueSetter: createLooseValueSetter('quantity'),
        width: 120,
      },
      {
        ...euroColDef,
        cellEditorParams: { min: 0 },
        editable: true,
        context: unitPriceContext,
        field: 'owned.loose.unitBoughtPrice',
        headerName: 'Unit bought',
        valueSetter: createLooseValueSetter('unitBoughtPrice'),
      },
      {
        ...euroColDef,
        cellEditorParams: { min: 0 },
        editable: true,
        context: unitPriceContext,
        field: 'owned.loose.unitMarketValue',
        headerName: 'Unit market value',
        valueSetter: createLooseValueSetter('unitMarketValue'),
      },
      {
        ...euroColDef,
        context: looseSumContext,
        colId: 'totalBought',
        headerName: 'Total bought',
        valueGetter: ({ data }) =>
          data
            ? data.owned.loose.quantity * data.owned.loose.unitBoughtPrice
            : 0,
      },
      {
        ...euroColDef,
        context: looseSumContext,
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
        headerName: 'Links',
        resizable: false,
        sortable: false,
        width: 100,
      },
    ] as const satisfies Array<ColDef<CollectionMinifig>>
  }, [agGridClasses, editLooseMinifig])
}

export default useLooseMinifigsColDefs
