import type { ColDef } from 'ag-grid-community'
import get from 'lodash/get'
import assert from 'node:assert/strict'
import { test } from 'vitest'

import { OverflowTypographyCellRenderer } from '../column'
import buildTotalRowColDefs from './buildTotalRowColDefs'

type Row = { id: string; prices: { bought: number }; quantity: number }

const row: Row = { id: '10188', prices: { bought: 40 }, quantity: 2 }

const totalRowNode = { rowPinned: 'bottom' }
const rowNode = { rowPinned: undefined }

const runColDefProperty = ({
  colDef,
  property,
  params,
}: {
  colDef: ColDef<Row>
  property: keyof ColDef<Row>
  params: object
}) => {
  const [wrapped] = buildTotalRowColDefs<Row>([colDef]) ?? []
  const value: unknown = get(wrapped, property)
  return typeof value === 'function'
    ? Reflect.apply(value, undefined, [params])
    : value
}

test.for<{
  name: string
  colDef: ColDef<Row>
  property: keyof ColDef<Row>
  params: object
  expected: unknown
}>([
  {
    name: 'reads a nested total by colId',
    colDef: { field: 'prices.bought' },
    property: 'valueGetter',
    params: { node: totalRowNode, data: { prices: { bought: 120 } } },
    expected: 120,
  },
  {
    name: 'leaves a column sharing a field empty on the total row',
    colDef: { colId: 'actions', field: 'id' },
    property: 'valueGetter',
    params: { node: totalRowNode, data: { id: '3' } },
    expected: null,
  },
  {
    name: 'reads the field on a normal row',
    colDef: { field: 'prices.bought' },
    property: 'valueGetter',
    params: { node: rowNode, data: row },
    expected: 40,
  },
  {
    name: 'keeps the value getter on a normal row',
    colDef: {
      colId: 'total',
      valueGetter: ({ data }) => (data ? data.quantity * 10 : null),
    },
    property: 'valueGetter',
    params: { node: rowNode, data: row },
    expected: 20,
  },
  {
    name: 'renders plain text on the total row',
    colDef: { field: 'id' },
    property: 'cellRendererSelector',
    params: { node: totalRowNode },
    expected: { component: OverflowTypographyCellRenderer },
  },
  {
    name: 'keeps the column renderer on a normal row',
    colDef: { field: 'id' },
    property: 'cellRendererSelector',
    params: { node: rowNode },
    expected: undefined,
  },
  {
    name: 'drops the cell class on the total row',
    colDef: { field: 'id', cellClass: ['center'] },
    property: 'cellClass',
    params: { node: totalRowNode },
    expected: undefined,
  },
  {
    name: 'keeps the cell class on a normal row',
    colDef: { field: 'id', cellClass: ['center'] },
    property: 'cellClass',
    params: { node: rowNode },
    expected: ['center'],
  },
  {
    name: 'does not edit the total row',
    colDef: { field: 'quantity', editable: true },
    property: 'editable',
    params: { node: totalRowNode },
    expected: false,
  },
  {
    name: 'edits a normal row',
    colDef: { field: 'quantity', editable: true },
    property: 'editable',
    params: { node: rowNode },
    expected: true,
  },
  {
    name: 'shows a formatted total as it is',
    colDef: {
      field: 'quantity',
      valueFormatter: ({ value }) => `${value} pcs`,
    },
    property: 'valueFormatter',
    params: { node: totalRowNode, value: '1 025' },
    expected: '1 025',
  },
  {
    name: 'shows an empty total as blank',
    colDef: {
      field: 'quantity',
      valueFormatter: ({ value }) => `${value} pcs`,
    },
    property: 'valueFormatter',
    params: { node: totalRowNode, value: null },
    expected: '',
  },
])('buildTotalRowColDefs $name', ({ colDef, property, params, expected }) => {
  assert.deepEqual(runColDefProperty({ colDef, property, params }), expected)
})

test('buildTotalRowColDefs wraps the columns of a group', () => {
  const [group] =
    buildTotalRowColDefs<Row>([
      { headerName: 'Prices', children: [{ field: 'prices.bought' }] },
    ]) ?? []
  const [child] = group && 'children' in group ? group.children : []
  assert.equal(
    child &&
      !('children' in child) &&
      typeof child.valueGetter === 'function' &&
      Reflect.apply(child.valueGetter, undefined, [
        { node: totalRowNode, data: { prices: { bought: 7 } } },
      ]),
    7
  )
})
