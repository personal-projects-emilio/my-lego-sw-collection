import get from 'lodash/get'
import assert from 'node:assert/strict'
import type { MapColIdsToTotals, TotalRowData } from 'types/totalRow'
import { test } from 'vitest'

import { getColumnTotals, isTotalRow } from './totalRow.ts'

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
  mapColIdsToTotals: MapColIdsToTotals<Row>
  expected: TotalRowData
}>([
  {
    name: 'counts the rows with thousand separators',
    rows: Array.from({ length: 1025 }, () => rows[0]),
    mapColIdsToTotals: { id: { aggregation: 'count' } },
    expected: { id: '1 025' },
  },
  {
    name: 'sums a field and skips empty values',
    rows,
    mapColIdsToTotals: { price: { aggregation: 'sum' } },
    expected: { price: 40 },
  },
  {
    name: 'sums a nested field',
    rows,
    mapColIdsToTotals: { 'stock.quantity': { aggregation: 'sum' } },
    expected: { stock: { quantity: 6 } },
  },
  {
    name: 'sums the row values of a value getter column',
    rows,
    mapColIdsToTotals: { stockValue: { aggregation: 'sum' } },
    expected: { stockValue: 100 },
  },
  {
    name: 'sums a custom value and formats it',
    rows,
    mapColIdsToTotals: {
      minifigs: {
        aggregation: 'sum',
        getValue: ({ minifigs }) =>
          minifigs.reduce((total, { quantity }) => total + quantity, 0),
        formatValue: String,
      },
    },
    expected: { minifigs: '4' },
  },
  {
    name: 'averages weighted values and skips empty values',
    rows,
    mapColIdsToTotals: {
      price: {
        aggregation: 'weightedAverage',
        getWeight: ({ stock }) => stock.quantity,
      },
    },
    expected: { price: 25 },
  },
  {
    name: 'returns zero sums, zero count and no average without rows',
    rows: [],
    mapColIdsToTotals: {
      id: { aggregation: 'count' },
      price: { aggregation: 'sum' },
      'stock.quantity': {
        aggregation: 'weightedAverage',
        getWeight: ({ stock }) => stock.quantity,
        formatValue: String,
      },
    },
    expected: { id: '0', price: 0, stock: { quantity: null } },
  },
])('getColumnTotals $name', ({ rows, mapColIdsToTotals, expected }) => {
  assert.deepEqual(
    getColumnTotals({ rows, mapColIdsToTotals, readCellValue }),
    expected
  )
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
