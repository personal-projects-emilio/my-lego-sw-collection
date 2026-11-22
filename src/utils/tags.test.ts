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
  tagUsage,
  undoTagEdit,
} from './tags.ts'
import {
  minifigFixture,
  setFixture,
  setMinifigFixture,
} from './testFixtures.ts'

const tagsList: TagsList = [
  {
    id: 'saga',
    label: 'Saga',
    appliesTo: 'both',
    inherited: true,
  },
  { id: 'aor', label: 'Age of Rebellion', parent: 'saga' },
  { id: 'ot', label: 'Original Trilogy', parent: 'aor' },
  { id: 'anh', label: 'A New Hope', parent: 'ot' },
  { id: 'esb', label: 'The Empire Strikes Back', parent: 'ot' },
  { id: 'vehicle', label: 'Vehicle', appliesTo: 'sets' },
  { id: 'x-wing', label: 'X-wing', parent: 'vehicle' },
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
      storedTagsAfterPick({ tagsVocabulary, picked, stored, inheritedTags }),
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
  assert.deepEqual(filterTagsAfterPick({ tagsVocabulary, picked }), expected)
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
    { id: 'pilot', label: 'Pilot', appliesTo: 'minifigs' },
    { id: 'rebel-pilot', label: 'Rebel pilot', parent: 'pilot' },
    { id: 'seasonal', label: 'Seasonal', parent: 'vehicle' },
    { id: 'other', label: 'Other', appliesTo: 'both' },
    { id: 'misc', label: 'Misc', parent: 'other' },
  ],
  setsList: [
    setFixture({ id: 1, name: 'X-wing', tags: ['x-wing', 'anh'] }),
    setFixture({ id: 2, name: 'Falcon', tags: ['ot'] }),
  ],
  minifigsList: [
    minifigFixture({ id: 'sw0001', name: 'Luke', tags: ['rebel-pilot'] }),
  ],
}

const stateOf = (edit: TagEdit) => {
  assert.ok('state' in edit, 'refused' in edit ? edit.refused : '')
  return edit.state
}

const tagOf = ({ state, id }: { state: TagsState; id: string }) =>
  state.tagsList.find((tag) => tag.id === id)

const childrenOf = ({ state, parent }: { state: TagsState; parent: string }) =>
  buildTagsVocabulary(state.tagsList).sort(
    state.tagsList.filter((tag) => tag.parent === parent).map(({ id }) => id)
  )

test.for([
  {
    case: 'a tag under itself',
    edit: () => moveTag({ state: editState, id: 'aor', parent: 'aor' }),
  },
  {
    case: 'a tag under its descendant',
    edit: () => moveTag({ state: editState, id: 'aor', parent: 'anh' }),
  },
  {
    case: 'a set tag under a minifigs-only root',
    edit: () => moveTag({ state: editState, id: 'x-wing', parent: 'pilot' }),
  },
  {
    case: 'a minifig tag under a sets-only root',
    edit: () =>
      moveTag({ state: editState, id: 'rebel-pilot', parent: 'vehicle' }),
  },
  {
    case: 'the other root under another tag',
    edit: () => moveTag({ state: editState, id: 'other', parent: 'saga' }),
  },
  {
    case: 'narrowing a root used by sets to minifigs',
    edit: () =>
      editTag({
        state: editState,
        id: 'vehicle',
        changes: { appliesTo: 'minifigs' },
      }),
  },
  {
    case: 'deleting seasonal',
    edit: () => deleteTag({ state: editState, id: 'seasonal' }),
  },
  {
    case: 'deleting the other root',
    edit: () => deleteRoot({ state: editState, id: 'other', targetId: 'saga' }),
  },
  {
    case: 'deleting a root as a tag',
    edit: () => deleteTag({ state: editState, id: 'vehicle' }),
  },
  {
    case: 'deleting a root into a root that applies to fewer items',
    edit: () =>
      deleteRoot({ state: editState, id: 'saga', targetId: 'vehicle' }),
  },
  {
    case: 'a blank label',
    edit: () => addTag({ state: editState, label: '  ', parent: 'vehicle' }),
  },
  {
    case: 'root settings on a tag',
    edit: () =>
      editTag({ state: editState, id: 'x-wing', changes: { inherited: true } }),
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
    },
  },
  {
    case: 'starts a root as both, not inherited',
    label: 'Faction',
    parent: undefined,
    expected: {
      id: 'faction',
      label: 'Faction',
      appliesTo: 'both',
      inherited: false,
    },
  },
])('addTag $case', ({ label, parent, expected }) => {
  const state = stateOf(addTag({ state: editState, label, parent }))
  assert.deepEqual(tagOf({ state: state, id: expected.id }), expected)
})

test('editTag renames without changing the id or the items', () => {
  const state = stateOf(
    editTag({ state: editState, id: 'anh', changes: { label: 'Episode IV' } })
  )
  assert.equal(tagOf({ state: state, id: 'anh' })?.label, 'Episode IV')
  assert.equal(state.setsList, editState.setsList)
})

test.for([
  {
    case: 'moves a title to another parent',
    id: 'anh',
    parent: 'aor',
    expected: { aor: ['anh', 'ot'], ot: ['esb'] },
  },
  {
    case: 'moves a set tag under a root for both',
    id: 'x-wing',
    parent: 'other',
    expected: { other: ['misc', 'x-wing'], vehicle: ['seasonal'] },
  },
])('moveTag $case', ({ id, parent, expected }) => {
  const state = stateOf(moveTag({ state: editState, id: id, parent }))
  Object.entries(expected).forEach(([parent, ids]) =>
    assert.deepEqual(childrenOf({ state: state, parent: parent }), ids)
  )
})

test('moveTag turns a tag into a root for both, not inherited', () => {
  const state = stateOf(moveTag({ state: editState, id: 'misc' }))
  assert.deepEqual(tagOf({ state: state, id: 'misc' }), {
    id: 'misc',
    label: 'Misc',
    appliesTo: 'both',
    inherited: false,
  })
})

test('moveTag drops root settings when a root moves under a tag', () => {
  const state = stateOf(
    moveTag({ state: editState, id: 'pilot', parent: 'misc' })
  )
  assert.deepEqual(tagOf({ state: state, id: 'pilot' }), {
    id: 'pilot',
    label: 'Pilot',
    parent: 'misc',
  })
})

test('undoTagEdit keeps tags added after the edit', () => {
  const after = stateOf(
    editTag({ state: editState, id: 'anh', changes: { label: 'Episode IV' } })
  )
  const current = stateOf(
    addTag({ state: after, label: 'Droid', parent: 'other' })
  )
  const undone = undoTagEdit({ current, before: editState, after })
  assert.equal(tagOf({ state: undone, id: 'anh' })?.label, 'A New Hope')
  assert.equal(tagOf({ state: undone, id: 'droid' })?.label, 'Droid')
})

test('children sort A–Z, numbers by value', () => {
  const state = [{ label: 'Wing 10' }, { label: 'Wing 2' }].reduce(
    (current, { label }) =>
      stateOf(addTag({ state: current, label, parent: 'vehicle' })),
    editState
  )
  assert.deepEqual(childrenOf({ state: state, parent: 'vehicle' }), [
    'seasonal',
    'wing-2',
    'wing-10',
    'x-wing',
  ])
})

test('deleteTag removes it from items and moves its children up in place', () => {
  const state = stateOf(deleteTag({ state: editState, id: 'ot' }))
  assert.equal(tagOf({ state: state, id: 'ot' }), undefined)
  assert.deepEqual(childrenOf({ state: state, parent: 'aor' }), ['anh', 'esb'])
  assert.deepEqual(
    state.setsList.map(({ tags }) => tags),
    [['x-wing', 'anh'], []]
  )
  assert.equal(state.setsList[0], editState.setsList[0])
  assert.equal(state.minifigsList, editState.minifigsList)
})

test('deleteRoot moves its tags under the target root and keeps items', () => {
  const state = stateOf(deleteRoot({ state: editState, id: 'pilot' }))
  assert.equal(tagOf({ state: state, id: 'pilot' }), undefined)
  assert.deepEqual(childrenOf({ state: state, parent: 'other' }), [
    'misc',
    'rebel-pilot',
  ])
  assert.equal(state.minifigsList, editState.minifigsList)
  assert.equal(state.setsList, editState.setsList)
})

test('deleteRoot removes the root itself from items', () => {
  const tagged: TagsState = {
    ...editState,
    setsList: [
      setFixture({ id: 3, name: 'Shuttle', tags: ['vehicle', 'x-wing'] }),
    ],
  }
  const state = stateOf(
    deleteRoot({ state: tagged, id: 'vehicle', targetId: 'other' })
  )
  assert.deepEqual(
    state.setsList.map(({ tags }) => tags),
    [['x-wing']]
  )
})

test('addTag never uses a prototype key as id', () => {
  const state = stateOf(addTag({ state: editState, label: 'Constructor' }))
  assert.equal(tagOf({ state: state, id: 'constructor' }), undefined)
  assert.ok(tagOf({ state: state, id: 'constructor-2' }))
})

test.for([
  { case: 'inherited root', id: 'anh', expected: ['sw0001', 'sw0002'] },
  { case: 'root that is not inherited', id: 'x-wing', expected: ['sw0001'] },
])('tagUsage counts minifigs inheriting from a $case', ({ id, expected }) => {
  const state: TagsState = {
    ...editState,
    setsList: [
      setFixture({
        id: 1,
        name: 'X-wing',
        tags: ['x-wing', 'anh'],
        content: { minifigs: [setMinifigFixture({ id: 'sw0002' })] },
      }),
    ],
    minifigsList: [
      minifigFixture({ id: 'sw0001', name: 'Luke', tags: ['anh', 'x-wing'] }),
      minifigFixture({ id: 'sw0002', name: 'Biggs' }),
    ],
  }
  assert.deepEqual(
    tagUsage({ state, ids: [id] }).minifigs.map(({ id }) => id),
    expected
  )
})

test.for([
  { id: 'vehicle', expected: ['other', 'saga'] },
  { id: 'saga', expected: ['other'] },
])('rootTargets of $id', ({ id, expected }) => {
  assert.deepEqual(
    rootTargets({ tagsList: editState.tagsList, id }).map(({ id }) => id),
    expected
  )
})

test.for([
  {
    case: 'a move restores the tree and keeps items',
    edit: () => moveTag({ state: editState, id: 'anh', parent: 'aor' }),
    later: (state: TagsState) => state,
  },
  {
    case: 'a delete gives the tag back to its items',
    edit: () => deleteTag({ state: editState, id: 'ot' }),
    later: (state: TagsState) => state,
  },
  {
    case: 'a delete keeps tags added to its items afterwards',
    edit: () => deleteTag({ state: editState, id: 'ot' }),
    later: (state: TagsState) => ({
      ...state,
      setsList: state.setsList.map((set) =>
        set.id === 2 ? { ...set, tags: ['esb'] } : set
      ),
    }),
    expectedTags: [
      ['x-wing', 'anh'],
      ['esb', 'ot'],
    ],
  },
  {
    case: 'a delete keeps item edits made afterwards',
    edit: () => deleteTag({ state: editState, id: 'ot' }),
    later: (state: TagsState) => ({
      ...state,
      setsList: state.setsList.map((set) =>
        set.id === 1 ? { ...set, name: 'Renamed' } : set
      ),
    }),
  },
])('undoTagEdit $case', ({ edit, later, expectedTags }) => {
  const after = stateOf(edit())
  const current = later(after)
  const undone = undoTagEdit({ current, before: editState, after })
  assert.deepEqual(undone.tagsList, editState.tagsList)
  assert.deepEqual(
    undone.setsList.map(({ tags }) => tags),
    expectedTags ?? editState.setsList.map(({ tags }) => tags)
  )
  assert.deepEqual(
    undone.setsList.map(({ name }) => name),
    current.setsList.map(({ name }) => name)
  )
  assert.deepEqual(undone.minifigsList, current.minifigsList)
})
