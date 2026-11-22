import type { ColDef, ColumnState } from 'ag-grid-community'
import assert from 'node:assert/strict'
import type { ColumnLayout } from 'types/columnLayout'
import { test } from 'vitest'

import {
  canMoveColumn,
  type ChooserColumn,
  countSorts,
  groupColumns,
  hideExcluded,
  toColumnLayout,
  toExcludedColIds,
  toInitialState,
  toShowAllState,
} from './columnLayout.ts'

const layout: ColumnLayout = {
  columnOrder: { orderedColIds: ['id', 'name', 'price'] },
  columnPinning: { leftColIds: [], rightColIds: ['actions'] },
  columnSizing: { columnSizingModel: [{ colId: 'name', flex: 1 }] },
  columnVisibility: { hiddenColIds: ['name'] },
  sort: { sortModel: [] },
}

test.for([
  {
    name: 'fills the parts Firebase drops when empty',
    input: {
      state: {
        columnOrder: layout.columnOrder,
        columnPinning: { rightColIds: ['actions'] },
        columnSizing: layout.columnSizing,
        columnVisibility: layout.columnVisibility,
      },
    },
    expected: layout,
  },
  {
    name: 'keeps the previous hidden flag of excluded columns',
    input: {
      state: { columnVisibility: { hiddenColIds: ['name', 'price'] } },
      excludedColIds: ['price', 'year'],
      previous: {
        ...layout,
        columnVisibility: { hiddenColIds: ['id', 'year'] },
      },
    },
    expected: {
      ...toColumnLayout({ state: {} }),
      columnVisibility: { hiddenColIds: ['name', 'year'] },
    },
  },
])('toColumnLayout $name', ({ input, expected }) => {
  assert.deepEqual(toColumnLayout(input), expected)
})

test.for([
  { saved: null, excludedColIds: ['price'], expected: undefined },
  { saved: layout, excludedColIds: [], expected: ['name'] },
  {
    saved: layout,
    excludedColIds: ['price', 'name'],
    expected: ['name', 'price'],
  },
])(
  'toInitialState with $excludedColIds excluded hides $expected',
  ({ saved, excludedColIds, expected }) => {
    assert.deepEqual(
      toInitialState({ layout: saved, excludedColIds })?.columnVisibility
        ?.hiddenColIds,
      expected
    )
  }
)

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

const column = ({
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
  column({ colId: 'id', pinned: 'left' }),
  column({ colId: 'name' }),
  column({ colId: 'year' }),
  column({
    colId: 'actions',
    pinned: 'right',
    isLockedVisible: true,
    isLockedPosition: true,
  }),
  column({ colId: 'tags' }),
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
