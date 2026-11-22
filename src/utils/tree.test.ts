import assert from 'node:assert/strict'
import { test } from 'vitest'

import {
  buildTree,
  type FlatNode,
  getDropProjection,
  type TreeNode,
} from './tree.ts'

const nodes: TreeNode[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'aor', label: 'Age of Rebellion', parent: 'timeline' },
  { id: 'ot', label: 'Original Trilogy', parent: 'aor' },
  { id: 'anh', label: 'A New Hope', parent: 'ot' },
  { id: 'esb', label: 'The Empire Strikes Back', parent: 'ot' },
  { id: 'place', label: 'Place' },
  { id: 'tatooine', label: 'Tatooine', parent: 'place' },
  { id: 'bespin', label: 'Bespin', parent: 'place' },
  { id: 'carbonite', label: 'Carbonite Chamber', parent: 'bespin' },
]

const tree = buildTree({ nodes })

test.for([
  { ids: ['anh', 'aor', 'ot'], leaves: ['anh'], tops: ['aor'] },
  { ids: ['esb', 'anh'], leaves: ['anh', 'esb'], tops: ['anh', 'esb'] },
  {
    ids: ['carbonite', 'aor'],
    leaves: ['carbonite', 'aor'],
    tops: ['carbonite', 'aor'],
  },
])('leaves and tops of $ids', ({ ids, leaves, tops }) => {
  assert.deepEqual(tree.getLeaves(ids), leaves)
  assert.deepEqual(tree.getTops(ids), tops)
})

test.for([
  { ids: ['anh'], expected: ['aor', 'ot', 'anh'] },
  {
    ids: ['carbonite', 'esb'],
    expected: ['bespin', 'carbonite', 'aor', 'ot', 'esb'],
  },
])(
  'withImplied adds every ancestor except the root for $ids',
  ({ ids, expected }) => {
    assert.deepEqual(tree.addImplied(ids), expected)
  }
)

test.for([
  { id: 'anh', expected: 'Age of Rebellion › Original Trilogy › A New Hope' },
  { id: 'tatooine', expected: 'Tatooine' },
  { id: 'unknown', expected: 'unknown' },
])('pathLabel of $id', ({ id, expected }) => {
  assert.equal(tree.getPathLabel(id), expected)
})

test.for([
  {
    case: 'groups siblings and sorts A–Z',
    ids: ['carbonite', 'esb', 'tatooine', 'anh'],
    expected:
      'Bespin › Carbonite Chamber | Tatooine | Age of Rebellion › Original Trilogy › A New Hope, The Empire Strikes Back',
  },
  {
    case: 'collapses implied parents first',
    ids: ['ot', 'anh', 'bespin'],
    expected: 'Bespin | Age of Rebellion › Original Trilogy › A New Hope',
  },
])('groupedLabel $case', ({ ids, expected }) => {
  assert.equal(tree.getGroupedLabel(ids), expected)
})

test('outline lists every ancestor with its parent in tree order', () => {
  assert.deepEqual(tree.getOutline(['carbonite']), [
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
    case: 'stays with its siblings',
    active: 'esb',
    over: 'anh',
    delta: 0,
    expected: { parent: 'ot' },
  },
  {
    case: 'drops under another root',
    active: 'tatooine',
    over: 'esb',
    delta: 0,
    expected: { parent: 'ot' },
  },
  {
    case: 'nests under the row above when dragged right',
    active: 'esb',
    over: 'esb',
    delta: 1,
    expected: { parent: 'anh' },
  },
  {
    case: 'moves up a level when dragged left',
    active: 'esb',
    over: 'esb',
    delta: -1,
    expected: { parent: 'aor' },
  },
  {
    case: 'becomes a root when dragged fully left at the end',
    active: 'tatooine',
    over: 'tatooine',
    delta: -3,
    expected: { parent: undefined },
  },
  {
    case: 'keeps the depth of the next row',
    active: 'place',
    over: 'esb',
    delta: -5,
    expected: { parent: 'ot' },
  },
])('projectDrop $case', ({ active, over, delta, expected }) => {
  assert.deepEqual(
    getDropProjection({
      nodes: flat,
      activeId: active,
      overId: over,
      depthDelta: delta,
    }),
    expected
  )
})

test('buildTree sorts siblings with the given comparator', () => {
  const byLabelDesc = (a: TreeNode, b: TreeNode) =>
    b.label.localeCompare(a.label)
  assert.deepEqual(
    buildTree({ nodes, compare: byLabelDesc }).sort(['anh', 'esb']),
    ['esb', 'anh']
  )
})
