import assert from 'node:assert/strict'
import { test } from 'vitest'

import { buildTree, type FlatNode, projectDrop, type TreeNode } from './tree.ts'

const nodes: TreeNode[] = [
  { id: 'timeline', label: 'Timeline', order: 0 },
  { id: 'aor', label: 'Age of Rebellion', parent: 'timeline', order: 0 },
  { id: 'ot', label: 'Original Trilogy', parent: 'aor', order: 0 },
  { id: 'anh', label: 'A New Hope', parent: 'ot', order: 0 },
  { id: 'esb', label: 'The Empire Strikes Back', parent: 'ot', order: 1 },
  { id: 'place', label: 'Place', order: 1 },
  { id: 'tatooine', label: 'Tatooine', parent: 'place', order: 0 },
  { id: 'bespin', label: 'Bespin', parent: 'place', order: 1 },
  { id: 'carbonite', label: 'Carbonite Chamber', parent: 'bespin', order: 0 },
]

const tree = buildTree(nodes)

test.for([
  { ids: ['anh', 'aor', 'ot'], leaves: ['anh'], tops: ['aor'] },
  { ids: ['esb', 'anh'], leaves: ['anh', 'esb'], tops: ['anh', 'esb'] },
  {
    ids: ['carbonite', 'aor'],
    leaves: ['aor', 'carbonite'],
    tops: ['aor', 'carbonite'],
  },
])('leaves and tops of $ids', ({ ids, leaves, tops }) => {
  assert.deepEqual(tree.leaves(ids), leaves)
  assert.deepEqual(tree.tops(ids), tops)
})

test.for([
  { ids: ['anh'], expected: ['aor', 'ot', 'anh'] },
  {
    ids: ['carbonite', 'esb'],
    expected: ['aor', 'ot', 'esb', 'bespin', 'carbonite'],
  },
])(
  'withImplied adds every ancestor except the root for $ids',
  ({ ids, expected }) => {
    assert.deepEqual(tree.withImplied(ids), expected)
  }
)

test.for([
  { id: 'anh', expected: 'Age of Rebellion › Original Trilogy › A New Hope' },
  { id: 'tatooine', expected: 'Tatooine' },
  { id: 'unknown', expected: 'unknown' },
])('pathLabel of $id', ({ id, expected }) => {
  assert.equal(tree.pathLabel(id), expected)
})

test.for([
  {
    case: 'groups siblings and keeps tree order',
    ids: ['carbonite', 'esb', 'tatooine', 'anh'],
    expected:
      'Age of Rebellion › Original Trilogy › A New Hope, The Empire Strikes Back | Tatooine | Bespin › Carbonite Chamber',
  },
  {
    case: 'collapses implied parents first',
    ids: ['ot', 'anh', 'bespin'],
    expected: 'Age of Rebellion › Original Trilogy › A New Hope | Bespin',
  },
])('groupedLabel $case', ({ ids, expected }) => {
  assert.equal(tree.groupedLabel(ids), expected)
})

test('outline lists every ancestor with its parent in tree order', () => {
  assert.deepEqual(tree.outline(['carbonite']), [
    { id: 'place', label: 'Place', parent: undefined },
    { id: 'bespin', label: 'Bespin', parent: 'place' },
    { id: 'carbonite', label: 'Carbonite Chamber', parent: 'bespin' },
  ])
})

const flat: FlatNode[] = [
  { id: 'timeline', depth: 0 },
  { id: 'aor', parent: 'timeline', depth: 1 },
  { id: 'ot', parent: 'aor', depth: 2 },
  { id: 'anh', parent: 'ot', depth: 3 },
  { id: 'esb', parent: 'ot', depth: 3 },
  { id: 'place', depth: 0 },
  { id: 'tatooine', parent: 'place', depth: 1 },
]

test.for([
  {
    case: 'reorders among siblings',
    active: 'esb',
    over: 'anh',
    delta: 0,
    expected: { parent: 'ot', index: 0 },
  },
  {
    case: 'drops under another root',
    active: 'tatooine',
    over: 'esb',
    delta: 0,
    expected: { parent: 'ot', index: 1 },
  },
  {
    case: 'nests under the row above when dragged right',
    active: 'esb',
    over: 'esb',
    delta: 1,
    expected: { parent: 'anh', index: 0 },
  },
  {
    case: 'moves up a level when dragged left',
    active: 'esb',
    over: 'esb',
    delta: -1,
    expected: { parent: 'aor', index: 1 },
  },
  {
    case: 'becomes a root when dragged fully left at the end',
    active: 'tatooine',
    over: 'tatooine',
    delta: -3,
    expected: { parent: undefined, index: 2 },
  },
  {
    case: 'keeps the depth of the next row',
    active: 'place',
    over: 'esb',
    delta: -5,
    expected: { parent: 'ot', index: 1 },
  },
])('projectDrop $case', ({ active, over, delta, expected }) => {
  assert.deepEqual(
    projectDrop(flat, { activeId: active, overId: over, depthDelta: delta }),
    expected
  )
})
