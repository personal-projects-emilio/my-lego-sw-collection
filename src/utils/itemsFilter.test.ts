import assert from 'node:assert/strict'
import type { FilterSearch, ItemsFilterConfig } from 'types/itemsFilter'
import { test } from 'vitest'

import {
  doesItemPass,
  emptyItemsFilter,
  getActiveFields,
  getAppliedFilter,
  getConfigFields,
  getFieldLabel,
  getFilterOptions,
  hasFilterSearch,
  parseFilterSearch,
  pickFilterSearch,
  removeInactiveDisabledFields,
  toFilterSearch,
} from './itemsFilter.ts'

type Item = {
  id: string
  minifigs: string[]
  owned: boolean
  subtheme: string
  tags: string[]
}

const items: Item[] = [
  {
    id: '75192',
    minifigs: ['sw0001', 'sw0002'],
    owned: true,
    subtheme: 'Ultimate Collector Series',
    tags: ['vehicle'],
  },
  {
    id: '75313',
    minifigs: ['sw0003'],
    owned: false,
    subtheme: 'Ultimate Collector Series',
    tags: ['vehicle', 'walker'],
  },
  {
    id: '75257',
    minifigs: ['sw0001'],
    owned: true,
    subtheme: 'Episode IX',
    tags: [],
  },
]

const config: ItemsFilterConfig<Item> = {
  getBooleanValues: { owned: ({ owned }) => owned },
  getListValues: {
    minifigId: ({ minifigs }) =>
      minifigs.map((value) => ({ label: value, value })),
    setId: ({ id }) => [{ label: `${id} · set`, value: id }],
    subtheme: ({ subtheme }) => [{ label: subtheme, value: subtheme }],
    tags: ({ tags }) => tags.map((value) => ({ label: value, value })),
  },
  mapColumnIdsToFields: {},
}

test.for([
  { search: {}, passing: ['75192', '75313', '75257'] },
  { search: { setId: '75192,75257' }, passing: ['75192', '75257'] },
  { search: { setId: 75313 }, passing: ['75313'] },
  { search: { minifigId: 'sw0001' }, passing: ['75192', '75257'] },
  { search: { owned: true }, passing: ['75192', '75257'] },
  { search: { owned: false }, passing: ['75313'] },
  { search: { tags: 'walker' }, passing: ['75313'] },
  { search: { owned: true, tags: 'vehicle' }, passing: ['75192'] },
  {
    search: { owned: true, off: 'owned' },
    passing: ['75192', '75313', '75257'],
  },
  { search: { retired: true }, passing: ['75192', '75313', '75257'] },
] satisfies { search: FilterSearch; passing: string[] }[])(
  'doesItemPass with $search keeps $passing',
  ({ search, passing }) => {
    const filter = getAppliedFilter(parseFilterSearch(search))
    assert.deepEqual(
      items
        .filter((item) => doesItemPass({ config, filter, item }))
        .map(({ id }) => id),
      passing
    )
  }
)

test.for([
  { search: {}, expected: {} },
  { search: { q: 'falcon' }, expected: { q: 'falcon' } },
  { search: { q: 75192 }, expected: { q: 75192 } },
  { search: { setId: '1,2' }, expected: { setId: '1,2' } },
  { search: { owned: false }, expected: { owned: false } },
  { search: { owned: 'true' }, expected: { owned: true } },
  { search: { character: 'Han Solo' }, expected: { character: 'Han Solo' } },
  {
    search: { off: 'tags,unknown', tags: 'vehicle' },
    expected: { off: 'tags', tags: 'vehicle' },
  },
] satisfies { search: FilterSearch; expected: FilterSearch }[])(
  'parseFilterSearch then toFilterSearch turns $search into $expected',
  ({ search, expected }) => {
    assert.deepEqual(
      pickFilterSearch(toFilterSearch(parseFilterSearch(search))),
      expected
    )
  }
)

test.for([
  { search: {}, expected: false },
  { search: { q: 'falcon' }, expected: true },
  { search: { owned: false }, expected: true },
] satisfies { search: FilterSearch; expected: boolean }[])(
  'hasFilterSearch is $expected for $search',
  ({ search, expected }) => {
    assert.equal(hasFilterSearch(search), expected)
  }
)

test('removeInactiveDisabledFields drops fields that are no longer set', () => {
  assert.deepEqual(
    removeInactiveDisabledFields({
      ...emptyItemsFilter,
      disabledFields: ['tags', 'owned'],
      owned: false,
    }).disabledFields,
    ['owned']
  )
})

test('getActiveFields lists the set fields of a page', () => {
  assert.deepEqual(
    getActiveFields({
      fields: getConfigFields(config),
      filter: parseFilterSearch({ owned: false, setId: '1', retired: true }),
    }),
    ['setId', 'owned']
  )
})

test('getConfigFields keeps the canonical order', () => {
  assert.deepEqual(getConfigFields(config), [
    'minifigId',
    'setId',
    'subtheme',
    'owned',
    'tags',
  ])
})

test('getFilterOptions dedupes and sorts by label', () => {
  assert.deepEqual(
    getFilterOptions({ getValues: config.getListValues.subtheme!, items }),
    [
      { label: 'Episode IX', value: 'Episode IX' },
      {
        label: 'Ultimate Collector Series',
        value: 'Ultimate Collector Series',
      },
    ]
  )
})

test.for([
  { field: 'tags', label: 'Tags' },
  { field: 'setId', label: 'Set ID' },
  { field: 'owned', label: 'Owned' },
  { field: 'characterName', label: 'Character' },
] as const)('getFieldLabel of $field is $label', ({ field, label }) => {
  assert.equal(getFieldLabel(field), label)
})

test.for([
  { filter: { setId: ['75192'] }, expected: { setId: 75192 } },
  { filter: { setId: ['75192', '75193'] }, expected: { setId: '75192,75193' } },
  { filter: { setId: ['007'] }, expected: { setId: '007' } },
  { filter: { search: '42' }, expected: { q: 42 } },
])(
  'toFilterSearch writes $filter as $expected so URLs stay readable',
  ({ filter, expected }) => {
    assert.deepEqual(
      pickFilterSearch(toFilterSearch({ ...emptyItemsFilter, ...filter })),
      expected
    )
  }
)
