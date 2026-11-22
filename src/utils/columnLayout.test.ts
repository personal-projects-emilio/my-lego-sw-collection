import type { ColDef, ColumnState } from 'ag-grid-community'
import assert from 'node:assert/strict'
import { test } from 'vitest'

import {
  canMoveColumn,
  type ChooserColumn,
  countSorts,
  groupColumns,
  hideExcluded,
  toExcludedColIds,
  toInitialState,
  toShowAllState,
} from './columnLayout.ts'

test('toInitialState turns the saved column state into the grid initial state', () => {
  const columnState: ColumnState[] = [
    { colId: 'name', width: 200, hide: false, sort: 'desc', sortIndex: 1 },
    { colId: 'id', width: 120, pinned: 'left', sort: 'asc', sortIndex: 0 },
    { colId: 'year', flex: 1, hide: true },
    { colId: 'price', width: 90, hide: false },
    { colId: 'actions', width: 140, pinned: 'right' },
  ]

  assert.deepEqual(toInitialState({ columnState, excludedColIds: ['price'] }), {
    columnOrder: {
      orderedColIds: ['name', 'id', 'year', 'price', 'actions'],
    },
    columnPinning: { leftColIds: ['id'], rightColIds: ['actions'] },
    columnSizing: {
      columnSizingModel: [
        { colId: 'name', width: 200, flex: undefined },
        { colId: 'id', width: 120, flex: undefined },
        { colId: 'year', width: undefined, flex: 1 },
        { colId: 'price', width: 90, flex: undefined },
        { colId: 'actions', width: 140, flex: undefined },
      ],
    },
    columnVisibility: { hiddenColIds: ['year', 'price'] },
    sort: {
      sortModel: [
        { colId: 'id', sort: 'asc' },
        { colId: 'name', sort: 'desc' },
      ],
    },
  })
})

const columnDefs: ColDef[] = [
  { field: 'name' },
  { field: 'prices.bought', context: { isExcluded: true } },
  { colId: 'retired', context: { isExcluded: true } },
  { colId: 'tags', context: { isExcluded: false } },
]

test.for([
  {
    name: 'hideExcluded hides only the excluded column definitions',
    actual: () => hideExcluded(columnDefs),
    expected: [
      { field: 'name' },
      { field: 'prices.bought', context: { isExcluded: true }, hide: true },
      { colId: 'retired', context: { isExcluded: true }, hide: true },
      { colId: 'tags', context: { isExcluded: false } },
    ],
  },
  {
    name: 'toExcludedColIds uses colId, then field',
    actual: () => toExcludedColIds(columnDefs),
    expected: ['prices.bought', 'retired'],
  },
])('$name', ({ actual, expected }) => {
  assert.deepEqual(actual(), expected)
})

test('countSorts counts the sorted columns', () => {
  const state: ColumnState[] = [
    { colId: 'id', sort: 'asc', sortIndex: 1 },
    { colId: 'name', sort: null, sortIndex: null },
    { colId: 'year', sort: 'desc', sortIndex: 0 },
  ]
  assert.equal(countSorts(state), 2)
})

const buildColumn = ({
  colId,
  ...overrides
}: Partial<ChooserColumn> & { colId: string }): ChooserColumn => ({
  colId,
  headerName: colId,
  hide: false,
  isLockedVisible: false,
  isLockedPosition: false,
  ...overrides,
})

const columns = [
  buildColumn({ colId: 'id', pinned: 'left' }),
  buildColumn({ colId: 'name' }),
  buildColumn({ colId: 'year' }),
  buildColumn({
    colId: 'actions',
    pinned: 'right',
    isLockedVisible: true,
    isLockedPosition: true,
  }),
  buildColumn({ colId: 'tags' }),
]

test('groupColumns splits by pinned side', () => {
  const groups = groupColumns(columns)
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(groups).map(([group, items]) => [
        group,
        items.map(({ colId }) => colId),
      ])
    ),
    { left: ['id'], center: ['name', 'year', 'tags'], right: ['actions'] }
  )
})

test.for([
  { activeColId: 'tags', overColId: 'name', expected: true },
  { activeColId: 'name', overColId: 'year', expected: true },
  { activeColId: 'name', overColId: 'id', expected: false },
  { activeColId: 'actions', overColId: 'tags', expected: false },
  { activeColId: 'name', overColId: 'name', expected: false },
  { activeColId: 'name', overColId: 'missing', expected: false },
])(
  'canMoveColumn $activeColId over $overColId is $expected',
  ({ activeColId, overColId, expected }) => {
    assert.equal(canMoveColumn({ columns, activeColId, overColId }), expected)
  }
)

test.for([
  { hidden: [], expected: 'checked' },
  { hidden: ['name'], expected: 'indeterminate' },
  { hidden: ['id', 'name', 'year', 'tags'], expected: 'unchecked' },
])(
  'toShowAllState with $hidden hidden is $expected',
  ({ hidden, expected }) => {
    assert.equal(
      toShowAllState(
        columns.map((item) => ({ ...item, hide: hidden.includes(item.colId) }))
      ),
      expected
    )
  }
)
