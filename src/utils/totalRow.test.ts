import type { ColDef, ColGroupDef } from 'ag-grid-community'
import get from 'lodash/get'
import assert from 'node:assert/strict'
import type { TotalColumn, TotalRowData } from 'types/totalRow'
import { test } from 'vitest'

import { getColumnTotals, getTotalColumns, isTotalRow } from './totalRow.ts'

type Row = {
  id: string
  price: number | null
  stock: { quantity: number }
  minifigs: { quantity: number }[]
}

const rows: Row[] = [
  { id: 'a', price: 10, stock: { quantity: 1 }, minifigs: [{ quantity: 2 }] },
  { id: 'b', price: 30, stock: { quantity: 3 }, minifigs: [] },
  {
    id: 'c',
    price: null,
    stock: { quantity: 2 },
    minifigs: [{ quantity: 1 }, { quantity: 1 }],
  },
]

const readCellValue = ({ row, colId }: { row: Row; colId: string }) =>
  colId === 'stockValue'
    ? (row.price ?? 0) * row.stock.quantity
    : get(row, colId)

test.for<{
  name: string
  rows: Row[]
  totalColumns: TotalColumn<Row>[]
  expected: TotalRowData
}>([
  {
    name: 'counts the rows with thousand separators',
    rows: Array.from({ length: 1025 }, () => rows[0]),
    totalColumns: [{ colId: 'id', total: { aggregation: 'count' } }],
    expected: { id: '1 025' },
  },
  {
    name: 'sums a field and skips empty values',
    rows,
    totalColumns: [{ colId: 'price', total: { aggregation: 'sum' } }],
    expected: { price: 40 },
  },
  {
    name: 'sums a nested field into the nested shape',
    rows,
    totalColumns: [{ colId: 'stock.quantity', total: { aggregation: 'sum' } }],
    expected: { stock: { quantity: 6 } },
  },
  {
    name: 'sums the row values of a value getter column',
    rows,
    totalColumns: [{ colId: 'stockValue', total: { aggregation: 'sum' } }],
    expected: { stockValue: 100 },
  },
  {
    name: 'sums a custom value and formats it',
    rows,
    totalColumns: [
      {
        colId: 'minifigs',
        total: {
          aggregation: 'sum',
          getValue: ({ minifigs }) =>
            minifigs.reduce((total, { quantity }) => total + quantity, 0),
          formatValue: String,
        },
      },
    ],
    expected: { minifigs: '4' },
  },
  {
    name: 'averages weighted values and skips empty values',
    rows,
    totalColumns: [
      {
        colId: 'price',
        total: {
          aggregation: 'weightedAverage',
          getWeight: ({ stock }) => stock.quantity,
        },
      },
    ],
    expected: { price: 25 },
  },
  {
    name: 'returns zero sums, zero count and no average without rows',
    rows: [],
    totalColumns: [
      { colId: 'id', total: { aggregation: 'count' } },
      { colId: 'price', total: { aggregation: 'sum' } },
      {
        colId: 'stock.quantity',
        total: {
          aggregation: 'weightedAverage',
          getWeight: ({ stock }) => stock.quantity,
          formatValue: String,
        },
      },
    ],
    expected: { id: '0', price: 0, stock: { quantity: null } },
  },
])('getColumnTotals $name', ({ rows, totalColumns, expected }) => {
  assert.deepEqual(
    getColumnTotals({ rows, totalColumns, readCellValue }),
    expected
  )
})

const count = { aggregation: 'count' } as const
const sum = { aggregation: 'sum' } as const

test.for<{
  name: string
  columnDefs: (ColDef<Row> | ColGroupDef<Row>)[] | undefined
  expected: TotalColumn<Row>[]
}>([
  { name: 'no columns', columnDefs: undefined, expected: [] },
  {
    name: 'columns with a total, by colId then field',
    columnDefs: [
      { field: 'id', context: { total: count } },
      { field: 'stock.quantity' },
      { colId: 'stockValue', context: { total: sum } },
      { colId: 'tags', context: { isExcluded: true } },
    ],
    expected: [
      { colId: 'id', total: count },
      { colId: 'stockValue', total: sum },
    ],
  },
  {
    name: 'columns inside a group',
    columnDefs: [
      {
        headerName: 'Stock',
        children: [{ field: 'stock.quantity', context: { total: sum } }],
      },
    ],
    expected: [{ colId: 'stock.quantity', total: sum }],
  },
])('getTotalColumns reads $name', ({ columnDefs, expected }) => {
  assert.deepEqual(getTotalColumns(columnDefs), expected)
})

test.for([
  { rowPinned: 'bottom', expected: true },
  { rowPinned: 'top', expected: false },
  { rowPinned: null, expected: false },
] as const)(
  'isTotalRow is $expected for $rowPinned',
  ({ rowPinned, expected }) => {
    assert.equal(isTotalRow({ rowPinned }), expected)
  }
)
