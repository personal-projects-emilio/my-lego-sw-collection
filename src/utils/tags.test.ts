import assert from 'node:assert/strict'
import type { InheritedTags, TagsList } from 'types/tags'
import { test } from 'vitest'

import {
  addTag,
  buildTagsVocabulary,
  deleteRoot,
  deleteTag,
  editTag,
  filterTagsAfterPick,
  inheritedFrom,
  moveTag,
  rootTargets,
  storedTagsAfterPick,
  type TagEdit,
  type TagsState,
  undoTagEdit,
} from './tags.ts'

const tagsList: TagsList = [
  {
    id: 'timeline',
    label: 'Timeline',
    order: 0,
    appliesTo: 'both',
    inherited: true,
  },
  { id: 'aor', label: 'Age of Rebellion', parent: 'timeline', order: 0 },
  { id: 'ot', label: 'Original Trilogy', parent: 'aor', order: 0 },
  { id: 'anh', label: 'A New Hope', parent: 'ot', order: 0 },
  { id: 'esb', label: 'The Empire Strikes Back', parent: 'ot', order: 1 },
  { id: 'vehicle', label: 'Vehicle', order: 1, appliesTo: 'sets' },
  { id: 'x-wing', label: 'X-wing', parent: 'vehicle', order: 0 },
]

const tagsVocabulary = buildTagsVocabulary(tagsList)

const noInherited: InheritedTags = {}
const anhFromSet: InheritedTags = { aor: [1], ot: [1], anh: [1] }

test.for([
  {
    case: 'stores a picked tag',
    picked: ['anh'],
    stored: [],
    inheritedTags: noInherited,
    expected: ['anh'],
  },
  {
    case: 'replaces a stored parent with its picked child',
    picked: ['ot', 'anh'],
    stored: ['ot'],
    inheritedTags: noInherited,
    expected: ['anh'],
  },
  {
    case: 'removes an unpicked tag',
    picked: ['esb'],
    stored: ['anh', 'esb'],
    inheritedTags: noInherited,
    expected: ['esb'],
  },
  {
    case: 'never stores a tag that is only inherited',
    picked: ['anh', 'esb'],
    stored: ['esb'],
    inheritedTags: anhFromSet,
    expected: ['esb'],
  },
  {
    case: 'keeps a hand-picked tag a set also provides, even when cleared',
    picked: [],
    stored: ['anh'],
    inheritedTags: anhFromSet,
    expected: ['anh'],
  },
])(
  'storedTagsAfterPick $case',
  ({ picked, stored, inheritedTags, expected }) => {
    assert.deepEqual(
      storedTagsAfterPick(tagsVocabulary, { picked, stored, inheritedTags }),
      expected
    )
  }
)

test.for([
  {
    case: 'keeps a picked parent over its child',
    picked: ['aor', 'anh'],
    expected: ['aor'],
  },
  { case: 'keeps siblings', picked: ['esb', 'anh'], expected: ['anh', 'esb'] },
])('filterTagsAfterPick $case', ({ picked, expected }) => {
  assert.deepEqual(filterTagsAfterPick(tagsVocabulary, picked), expected)
})

test.for([
  { target: 'sets' as const, expected: ['aor', 'ot', 'anh', 'esb', 'x-wing'] },
  { target: 'minifigs' as const, expected: ['aor', 'ot', 'anh', 'esb'] },
])(
  'pickable for $target skips roots and other item types',
  ({ target, expected }) => {
    assert.deepEqual(tagsVocabulary.pickable(target), expected)
  }
)

test('inheritedFrom lists the source sets', () => {
  assert.equal(inheritedFrom([75301, '75315']), 'Inherited from 75301, 75315')
})

test('buildTagsVocabulary reuses the vocabulary for the same tags list', () => {
  assert.equal(buildTagsVocabulary(tagsList), tagsVocabulary)
  assert.notEqual(buildTagsVocabulary([...tagsList]), tagsVocabulary)
})

const editState: TagsState = {
  tagsList: [
    ...tagsList,
    { id: 'pilot', label: 'Pilot', order: 2, appliesTo: 'minifigs' },
    { id: 'rebel-pilot', label: 'Rebel pilot', parent: 'pilot', order: 0 },
    { id: 'seasonal', label: 'Seasonal', parent: 'vehicle', order: 1 },
    { id: 'other', label: 'Other', order: 3, appliesTo: 'both' },
    { id: 'misc', label: 'Misc', parent: 'other', order: 0 },
  ],
  setsList: [
    { id: 1, name: 'X-wing', tags: ['x-wing', 'anh'] },
    { id: 2, name: 'Falcon', tags: ['ot'] },
  ] as TagsState['setsList'],
  minifigsList: [
    { id: 'sw0001', name: 'Luke', tags: ['rebel-pilot'] },
  ] as TagsState['minifigsList'],
}

const stateOf = (edit: TagEdit) => {
  assert.ok('state' in edit, 'refused' in edit ? edit.refused : '')
  return edit.state
}

const tagOf = (state: TagsState, id: string) =>
  state.tagsList.find((tag) => tag.id === id)

const childrenOf = (state: TagsState, parent: string) =>
  state.tagsList
    .filter((tag) => tag.parent === parent)
    .sort((a, b) => a.order - b.order)
    .map(({ id }) => id)

test.for([
  {
    case: 'a tag under itself',
    edit: () => moveTag(editState, 'aor', { parent: 'aor', index: 0 }),
  },
  {
    case: 'a tag under its descendant',
    edit: () => moveTag(editState, 'aor', { parent: 'anh', index: 0 }),
  },
  {
    case: 'a set tag under a minifigs-only root',
    edit: () => moveTag(editState, 'x-wing', { parent: 'pilot', index: 0 }),
  },
  {
    case: 'a minifig tag under a sets-only root',
    edit: () =>
      moveTag(editState, 'rebel-pilot', { parent: 'vehicle', index: 0 }),
  },
  {
    case: 'the other root under another tag',
    edit: () => moveTag(editState, 'other', { parent: 'timeline', index: 0 }),
  },
  {
    case: 'narrowing a root used by sets to minifigs',
    edit: () => editTag(editState, 'vehicle', { appliesTo: 'minifigs' }),
  },
  { case: 'deleting seasonal', edit: () => deleteTag(editState, 'seasonal') },
  {
    case: 'deleting the other root',
    edit: () => deleteRoot(editState, 'other', 'timeline'),
  },
  {
    case: 'deleting a root as a tag',
    edit: () => deleteTag(editState, 'vehicle'),
  },
  {
    case: 'deleting a root into a root that applies to fewer items',
    edit: () => deleteRoot(editState, 'timeline', 'vehicle'),
  },
  {
    case: 'a blank label',
    edit: () => addTag(editState, { label: '  ', parent: 'vehicle' }),
  },
])('refuses $case', ({ edit }) => {
  assert.ok('refused' in edit())
})

test.for([
  {
    case: 'appends a child with a unique id',
    label: 'X-wing',
    parent: 'vehicle',
    expected: {
      id: 'x-wing-2',
      label: 'X-wing',
      parent: 'vehicle',
      order: 2,
    },
  },
  {
    case: 'starts a root as both, not inherited',
    label: 'Faction',
    parent: undefined,
    expected: {
      id: 'faction',
      label: 'Faction',
      order: 4,
      appliesTo: 'both',
      inherited: false,
    },
  },
])('addTag $case', ({ label, parent, expected }) => {
  const state = stateOf(addTag(editState, { label, parent }))
  assert.deepEqual(tagOf(state, expected.id), expected)
})

test('editTag renames without changing the id or the items', () => {
  const state = stateOf(editTag(editState, 'anh', { label: 'Episode IV' }))
  assert.equal(tagOf(state, 'anh')?.label, 'Episode IV')
  assert.equal(state.setsList, editState.setsList)
})

test.for([
  {
    case: 'reorders among siblings',
    id: 'esb',
    parent: 'ot',
    index: 0,
    expected: { ot: ['esb', 'anh'] },
  },
  {
    case: 'moves a title to another parent',
    id: 'anh',
    parent: 'aor',
    index: 0,
    expected: { aor: ['anh', 'ot'], ot: ['esb'] },
  },
  {
    case: 'moves a set tag under a root for both',
    id: 'x-wing',
    parent: 'other',
    index: 1,
    expected: { other: ['misc', 'x-wing'], vehicle: ['seasonal'] },
  },
])('moveTag $case', ({ id, parent, index, expected }) => {
  const state = stateOf(moveTag(editState, id, { parent, index }))
  Object.entries(expected).forEach(([parent, ids]) =>
    assert.deepEqual(childrenOf(state, parent), ids)
  )
})

test('moveTag turns a tag into a root for both, not inherited', () => {
  const state = stateOf(moveTag(editState, 'misc', { index: 0 }))
  assert.deepEqual(tagOf(state, 'misc'), {
    id: 'misc',
    label: 'Misc',
    order: 0,
    appliesTo: 'both',
    inherited: false,
  })
  assert.equal(tagOf(state, 'timeline')?.order, 1)
})

test('moveTag drops root settings when a root moves under a tag', () => {
  const state = stateOf(
    moveTag(editState, 'pilot', { parent: 'misc', index: 0 })
  )
  assert.deepEqual(tagOf(state, 'pilot'), {
    id: 'pilot',
    label: 'Pilot',
    order: 0,
    parent: 'misc',
  })
})

test('deleteTag removes it from items and moves its children up in place', () => {
  const state = stateOf(deleteTag(editState, 'ot'))
  assert.equal(tagOf(state, 'ot'), undefined)
  assert.deepEqual(childrenOf(state, 'aor'), ['anh', 'esb'])
  assert.deepEqual(
    state.setsList.map(({ tags }) => tags),
    [['x-wing', 'anh'], []]
  )
  assert.equal(state.setsList[0], editState.setsList[0])
  assert.equal(state.minifigsList, editState.minifigsList)
})

test('deleteRoot moves its tags under the target root and keeps items', () => {
  const state = stateOf(deleteRoot(editState, 'pilot'))
  assert.equal(tagOf(state, 'pilot'), undefined)
  assert.deepEqual(childrenOf(state, 'other'), ['misc', 'rebel-pilot'])
  assert.equal(state.minifigsList, editState.minifigsList)
  assert.equal(state.setsList, editState.setsList)
})

test.for([
  { id: 'vehicle', expected: ['timeline', 'other'] },
  { id: 'timeline', expected: ['other'] },
])('rootTargets of $id', ({ id, expected }) => {
  assert.deepEqual(
    rootTargets(editState.tagsList, id).map(({ id }) => id),
    expected
  )
})

test.for([
  {
    case: 'a move restores the tree and keeps items',
    edit: () => moveTag(editState, 'anh', { parent: 'aor', index: 0 }),
    later: (state: TagsState) => state,
  },
  {
    case: 'a delete gives the tag back to its items',
    edit: () => deleteTag(editState, 'ot'),
    later: (state: TagsState) => state,
  },
  {
    case: 'a delete keeps item edits made afterwards',
    edit: () => deleteTag(editState, 'ot'),
    later: (state: TagsState) => ({
      ...state,
      setsList: state.setsList.map((set) =>
        set.id === 1 ? { ...set, name: 'Renamed' } : set
      ),
    }),
  },
])('undoTagEdit $case', ({ edit, later }) => {
  const after = stateOf(edit())
  const current = later(after)
  const undone = undoTagEdit(current, { before: editState, after })
  assert.deepEqual(undone.tagsList, editState.tagsList)
  assert.deepEqual(
    undone.setsList.map(({ tags }) => tags),
    editState.setsList.map(({ tags }) => tags)
  )
  assert.deepEqual(
    undone.setsList.map(({ name }) => name),
    current.setsList.map(({ name }) => name)
  )
  assert.deepEqual(undone.minifigsList, current.minifigsList)
})
