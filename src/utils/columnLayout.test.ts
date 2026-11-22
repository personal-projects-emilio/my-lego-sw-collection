import type { ColumnState } from 'ag-grid-community'
import assert from 'node:assert/strict'
import type { ColumnLayout } from 'types/columnLayout'
import { test } from 'vitest'

import {
  type ChooserColumn,
  countSorts,
  groupColumns,
  hideExcluded,
  moveColumn,
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

test('toColumnLayout fills the parts Firebase drops when empty', () => {
  assert.deepEqual(
    toColumnLayout({
      state: {
        columnOrder: layout.columnOrder,
        columnPinning: { rightColIds: ['actions'] },
        columnSizing: layout.columnSizing,
        columnVisibility: layout.columnVisibility,
      },
    }),
    layout
  )
})

test('toColumnLayout leaves excluded columns out of the hidden ones', () => {
  assert.deepEqual(
    toColumnLayout({
      state: { columnVisibility: { hiddenColIds: ['name', 'price'] } },
      excludedColIds: ['price'],
    }).columnVisibility,
    { hiddenColIds: ['name'] }
  )
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

test('hideExcluded hides only the excluded column definitions', () => {
  assert.deepEqual(
    hideExcluded([
      { field: 'name' },
      { field: 'prices.bought', context: { isExcluded: true } },
    ]),
    [
      { field: 'name' },
      { field: 'prices.bought', context: { isExcluded: true }, hide: true },
    ]
  )
})

test('toExcludedColIds uses colId, then field', () => {
  assert.deepEqual(
    toExcludedColIds([
      { field: 'name' },
      { field: 'prices.bought', context: { isExcluded: true } },
      { colId: 'retired', context: { isExcluded: true } },
      { colId: 'tags', context: { isExcluded: false } },
    ]),
    ['prices.bought', 'retired']
  )
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
  isExcluded: false,
  isLockedVisible: false,
  isLockedPosition: false,
  ...overrides,
})

const columns = [
  column({ colId: 'id', pinned: 'left' }),
  column({ colId: 'name' }),
  column({ colId: 'price', isExcluded: true }),
  column({ colId: 'year' }),
  column({
    colId: 'actions',
    pinned: 'right',
    isLockedVisible: true,
    isLockedPosition: true,
  }),
  column({ colId: 'tags' }),
]

test('groupColumns splits by pinned side and skips excluded columns', () => {
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
  {
    activeColId: 'tags',
    overColId: 'name',
    expected: ['id', 'tags', 'name', 'price', 'year', 'actions'],
  },
  {
    activeColId: 'name',
    overColId: 'year',
    expected: ['id', 'price', 'year', 'name', 'actions', 'tags'],
  },
  { activeColId: 'name', overColId: 'id', expected: undefined },
  { activeColId: 'actions', overColId: 'tags', expected: undefined },
  { activeColId: 'name', overColId: 'name', expected: undefined },
])(
  'moveColumn $activeColId over $overColId',
  ({ activeColId, overColId, expected }) => {
    assert.deepEqual(moveColumn({ columns, activeColId, overColId }), expected)
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
