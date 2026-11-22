import type { ColumnState } from 'ag-grid-community'
import assert from 'node:assert/strict'
import { test } from 'vitest'

import {
  addSortBy,
  type ChooserColumn,
  clearSorts,
  countSorts,
  groupColumns,
  moveColumn,
  sortBy,
  toApplyColumnStateParams,
  toColumnLayout,
  toExcludedColIds,
  toSavedColumnState,
  toShowAllState,
  toVisibilityState,
} from './columnLayout.ts'

test.for([
  {
    name: 'drops empty fields',
    state: { colId: 'name', hide: false, width: 120, flex: null, sort: null },
    expected: { colId: 'name', hide: false, width: 120 },
  },
  {
    name: 'keeps sort and its index',
    state: { colId: 'id', hide: null, flex: 1, sort: 'asc', sortIndex: 2 },
    expected: { colId: 'id', hide: false, flex: 1, sort: 'asc', sortIndex: 2 },
  },
  {
    name: 'drops a sort index without a sort',
    state: { colId: 'id', sort: null, sortIndex: 0 },
    expected: { colId: 'id', hide: false },
  },
  {
    name: 'turns pinned true into left',
    state: { colId: 'id', pinned: true },
    expected: { colId: 'id', hide: false, pinned: 'left' },
  },
] satisfies { name: string; state: ColumnState; expected: object }[])(
  'toSavedColumnState $name',
  ({ state, expected }) => {
    assert.deepEqual(toSavedColumnState(state), expected)
  }
)

test.for([
  {
    name: 'keeps the last saved state of an excluded column',
    saved: [{ colId: 'price', hide: false, width: 200 }],
    expected: [
      { colId: 'id', hide: false, width: 100 },
      { colId: 'price', hide: false, width: 200 },
    ],
  },
  {
    name: 'shows an excluded column that was never saved',
    saved: null,
    expected: [
      { colId: 'id', hide: false, width: 100 },
      { colId: 'price', hide: false, width: 80 },
    ],
  },
])('toColumnLayout $name', ({ saved, expected }) => {
  assert.deepEqual(
    toColumnLayout({
      state: [
        { colId: 'id', hide: false, width: 100 },
        { colId: 'price', hide: true, width: 80 },
      ],
      excludedColIds: ['price'],
      saved,
    }),
    expected
  )
})

test('toApplyColumnStateParams forces excluded columns hidden', () => {
  assert.deepEqual(
    toApplyColumnStateParams({
      layout: [
        { colId: 'price', hide: false, width: 90 },
        { colId: 'id', hide: false, flex: 1, sort: 'asc', sortIndex: 0 },
      ],
      excludedColIds: ['price', 'cost'],
    }),
    {
      state: [
        { colId: 'price', flex: null, hide: true, width: 90 },
        { colId: 'id', flex: 1, hide: false, sort: 'asc', sortIndex: 0 },
        { colId: 'cost', hide: true },
      ],
      applyOrder: true,
      defaultState: { hide: false, pinned: null, sort: null, sortIndex: null },
    }
  )
})

test.for([
  { colId: 'price', excludedColIds: ['price'], layout: null, hide: true },
  { colId: 'price', excludedColIds: [], layout: null, hide: false },
  {
    colId: 'price',
    excludedColIds: [],
    layout: [{ colId: 'price', hide: true }],
    hide: true,
  },
])(
  'toVisibilityState of $colId excluded by $excludedColIds is hidden: $hide',
  ({ colId, excludedColIds, layout, hide }) => {
    assert.deepEqual(
      toVisibilityState({ colIds: [colId], excludedColIds, layout }),
      [{ colId, hide }]
    )
  }
)

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

const sortState: ColumnState[] = [
  { colId: 'id', sort: 'asc', sortIndex: 1 },
  { colId: 'name', sort: null, sortIndex: null },
  { colId: 'year', sort: 'desc', sortIndex: 0 },
]

const sortsOf = (state: ColumnState[]) =>
  state.map(({ colId, sort, sortIndex }) => [colId, sort, sortIndex])

test.for([
  {
    name: 'replaces every sort',
    colId: 'name',
    sort: 'desc',
    expected: [
      ['id', null, null],
      ['name', 'desc', 0],
      ['year', null, null],
    ],
  },
  {
    name: 'clears every sort with none',
    colId: 'id',
    sort: null,
    expected: [
      ['id', null, null],
      ['name', null, null],
      ['year', null, null],
    ],
  },
] as const)('sortBy $name', ({ colId, sort, expected }) => {
  assert.deepEqual(sortsOf(sortBy({ state: sortState, colId, sort })), expected)
})

test.for([
  {
    name: 'appends a new column',
    colId: 'name',
    sort: 'asc',
    expected: [
      ['id', 'asc', 1],
      ['name', 'asc', 2],
      ['year', 'desc', 0],
    ],
  },
  {
    name: 'changes the direction in place',
    colId: 'year',
    sort: 'asc',
    expected: [
      ['id', 'asc', 1],
      ['name', null, null],
      ['year', 'asc', 0],
    ],
  },
  {
    name: 'removes a column and reindexes',
    colId: 'year',
    sort: null,
    expected: [
      ['id', 'asc', 0],
      ['name', null, null],
      ['year', null, null],
    ],
  },
] as const)('addSortBy $name', ({ colId, sort, expected }) => {
  assert.deepEqual(
    sortsOf(addSortBy({ state: sortState, colId, sort })),
    expected
  )
})

test('clearSorts and countSorts', () => {
  assert.equal(countSorts(sortState), 2)
  assert.equal(countSorts(clearSorts(sortState)), 0)
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
