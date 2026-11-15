import assert from 'node:assert/strict'
import type { InheritedTags, TagsList } from 'types/tags'
import { test } from 'vitest'

import {
  buildTagsVocabulary,
  filterTagsAfterPick,
  inheritedFrom,
  storedTagsAfterPick,
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
