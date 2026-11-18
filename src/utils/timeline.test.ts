import assert from 'node:assert/strict'
import type { TimelineList } from 'types/timeline'
import { test } from 'vitest'

import {
  buildTimeline,
  canToggle,
  deleteEntry,
  formatRange,
  pickStatus,
  saveEntry,
  type TimelineEdit,
  type TimelineState,
  togglePick,
} from './timeline.ts'

const timelineList: TimelineList = [
  { id: 'aor', label: 'Age of Rebellion', start: 0, end: 5 },
  { id: 'ot', label: 'Original Trilogy', parent: 'aor' },
  {
    id: 'anh',
    label: 'A New Hope',
    parent: 'ot',
    kind: 'movie',
    start: 0,
  },
  {
    id: 'rotj',
    label: 'Return of the Jedi',
    parent: 'ot',
    kind: 'movie',
    start: 4,
  },
]

const state: TimelineState = {
  timelineList,
  setsList: [
    { id: 1, name: 'X-wing', appearances: ['anh'] },
    { id: 2, name: 'Speeder', appearances: ['rotj'] },
  ] as TimelineState['setsList'],
  minifigsList: [
    { id: 'sw0001', name: 'Luke', appearances: ['ot', 'rotj'] },
  ] as TimelineState['minifigsList'],
}

const stateOf = (edit: TimelineEdit) => {
  assert.ok('state' in edit, 'refused' in edit ? edit.refused : '')
  return edit.state
}

const entryOf = (current: TimelineState, id: string) =>
  current.timelineList.find((entry) => entry.id === id)

test.for([
  { case: 'a blank label', entry: { id: 'anh', label: '  ' } },
  { case: 'an unknown parent', entry: { label: 'Andor', parent: 'nope' } },
  {
    case: 'a move under itself',
    entry: { id: 'ot', label: 'Original Trilogy', parent: 'ot' },
  },
  {
    case: 'a move under its descendant',
    entry: { id: 'aor', label: 'Age of Rebellion', parent: 'anh' },
  },
  {
    case: 'an end before the start',
    entry: { id: 'anh', label: 'A New Hope', start: 4, end: 0 },
  },
])('saveEntry refuses $case', ({ entry }) => {
  assert.ok('refused' in saveEntry(state, entry))
})

test('saveEntry adds an entry with an id made from its label', () => {
  const next = stateOf(
    saveEntry(state, { label: 'A New Hope', parent: 'ot', kind: 'movie' })
  )
  assert.deepEqual(entryOf(next, 'a-new-hope'), {
    id: 'a-new-hope',
    label: 'A New Hope',
    parent: 'ot',
    kind: 'movie',
  })
})

test('saveEntry edits an entry in place and keeps its id and the items', () => {
  const next = stateOf(
    saveEntry(state, {
      id: 'anh',
      label: ' Episode IV ',
      parent: 'aor',
      start: 0,
      end: 0,
    })
  )
  assert.deepEqual(entryOf(next, 'anh'), {
    id: 'anh',
    label: 'Episode IV',
    parent: 'aor',
    start: 0,
    end: 0,
  })
  assert.equal(next.setsList, state.setsList)
})

test('deleteEntry removes it from items and moves its children up', () => {
  const next = stateOf(deleteEntry(state, 'ot'))
  assert.equal(entryOf(next, 'ot'), undefined)
  assert.deepEqual(
    next.timelineList
      .filter(({ parent }) => parent === 'aor')
      .map(({ id }) => id),
    ['anh', 'rotj']
  )
  assert.deepEqual(next.minifigsList[0].appearances, ['rotj'])
  assert.equal(next.setsList, state.setsList)
})

test('deleteEntry refuses an unknown entry', () => {
  assert.ok('refused' in deleteEntry(state, 'nope'))
})

test.for([
  { id: 'ot', expected: '0 BBY/ABY – 4 ABY' },
  { id: 'aor', expected: '0 BBY/ABY – 5 ABY' },
  { id: 'anh', expected: '0 BBY/ABY' },
])(
  'a range of $id spans its children when it has no dates',
  ({ id, expected }) => {
    assert.equal(formatRange(buildTimeline(timelineList).range(id)), expected)
  }
)

const picks = (value: string[], inherited: Record<string, string[]> = {}) => ({
  value,
  inherited,
})

test.for([
  { case: 'adds a title', value: [], id: 'anh', expected: ['anh'] },
  {
    case: 'drops a stored ancestor when adding below it',
    value: ['ot'],
    id: 'rotj',
    expected: ['rotj'],
  },
  {
    case: 'removes a pick',
    value: ['anh', 'rotj'],
    id: 'anh',
    expected: ['rotj'],
  },
  {
    case: 'clears the picks under an implied entry',
    value: ['anh', 'rotj'],
    id: 'ot',
    expected: [],
  },
  {
    case: 'keeps an inherited entry',
    value: [],
    inherited: { anh: ['75301'] },
    id: 'anh',
    expected: [],
  },
])('togglePick $case', ({ value, inherited, id, expected }) => {
  const timeline = buildTimeline(timelineList)
  assert.deepEqual(togglePick(timeline, picks(value, inherited), id), expected)
})

test.for([
  { id: 'anh', expected: 'inherited' },
  { id: 'ot', expected: 'implied' },
  { id: 'aor', expected: 'implied' },
  { id: 'rotj', expected: 'picked' },
])('pickStatus of $id is $expected', ({ id, expected }) => {
  assert.equal(
    pickStatus(
      buildTimeline(timelineList),
      picks(['rotj'], { anh: ['75301'] }),
      id
    ),
    expected
  )
})

test('canToggle is false for an entry implied only by inherited ones', () => {
  const timeline = buildTimeline(timelineList)
  assert.equal(canToggle(timeline, picks([], { anh: ['75301'] }), 'ot'), false)
  assert.equal(canToggle(timeline, picks(['anh']), 'ot'), true)
})
