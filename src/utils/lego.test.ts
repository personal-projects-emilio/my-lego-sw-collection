/// <reference types="node" />
import assert from 'node:assert/strict'
import type { LooseMinifig, Minifig } from 'types/minifigs'
import type { Set, SetsList } from 'types/sets'
import { test } from 'vitest'

import {
  buildCollection,
  isSetRetired,
  renameLooseMinifig,
  renameMinifigInSets,
  updateLooseMinifig,
} from './lego.ts'

test('renames a minifig in every set that contains it', () => {
  const minifig = { characterName: 'Han Solo', quantity: 1, isInFrame: false }
  const setsList = [
    { id: 1, content: { minifigs: [{ ...minifig, id: 'sw0001' }] } },
    { id: 2, content: { minifigs: [{ ...minifig, id: 'sw0002' }] } },
  ] as SetsList

  const renamed = renameMinifigInSets(setsList, 'sw0001', 'sw0001a')

  assert.equal(renamed[0].content.minifigs[0].id, 'sw0001a')
  assert.equal(renamed[1], setsList[1])
})

const minifig = (id: string) =>
  ({
    id,
    characterName: `Name ${id}`,
    timelines: [],
    appearances: [],
  }) as unknown as Minifig

const loose = (quantity: number): LooseMinifig => ({
  quantity,
  isInFrame: false,
  unitBoughtPrice: 2,
  unitMarketValue: 5,
})

const setWith = (id: number, ownedQuantity: number, tags: string[] = []) =>
  ({
    id,
    ownedQuantity,
    tags,
    timelines: ['Original'],
    appearances: ['A New Hope'],
    content: {
      minifigs: [
        {
          id: 'sw0001',
          characterName: 'Old name',
          quantity: 2,
          isInFrame: true,
        },
      ],
    },
  }) as unknown as Set

test('buildCollection adds owned set quantities to the loose total and lists every set', () => {
  const { minifigsList } = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [{ id: 'sw0001', ...loose(1) }],
    setsList: [setWith(1, 1), setWith(2, 0)],
  })

  assert.equal(minifigsList[0].owned.total, 3)
  assert.deepEqual(minifigsList[0].owned.loose, loose(1))
  assert.deepEqual(minifigsList[0].owned.inSet, [
    { setId: 1, quantity: 2, isInFrame: true, ownedQuantity: 1 },
    { setId: 2, quantity: 2, isInFrame: true, ownedQuantity: 0 },
  ])
})

test('buildCollection counts set minifigs once per owned copy of the set', () => {
  const { minifigsList } = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [{ id: 'sw0001', ...loose(1) }],
    setsList: [setWith(1, 2)],
  })

  assert.equal(minifigsList[0].owned.total, 5)
})

test('buildCollection gives a minifig without a loose entry an empty loose', () => {
  const { minifigsList } = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [],
  })

  assert.equal(minifigsList[0].owned.total, 0)
  assert.deepEqual(minifigsList[0].owned.loose, {
    quantity: 0,
    isInFrame: false,
    unitBoughtPrice: 0,
    unitMarketValue: 0,
  })
})

test.for([
  {
    case: 'merges changes into an entry',
    id: 'sw0002',
    quantity: 3,
    expected: [{ id: 'sw0002', ...loose(3) }],
  },
  {
    case: 'adds a sorted entry with default prices',
    id: 'sw0001',
    quantity: 1,
    expected: [
      { id: 'sw0001', ...loose(1), unitBoughtPrice: 0, unitMarketValue: 0 },
      { id: 'sw0002', ...loose(1) },
    ],
  },
  {
    case: 'drops the entry at quantity 0',
    id: 'sw0002',
    quantity: 0,
    expected: [],
  },
])('updateLooseMinifig $case', ({ id, quantity, expected }) => {
  const list = [{ id: 'sw0002', ...loose(1) }]

  assert.deepEqual(updateLooseMinifig(list, id, { quantity }), expected)
})

test('renameLooseMinifig moves the entry to the new id', () => {
  const list = [{ id: 'sw0001', ...loose(1) }]

  assert.deepEqual(renameLooseMinifig(list, 'sw0001', 'sw0001a'), [
    { id: 'sw0001a', ...loose(1) },
  ])
  assert.equal(renameLooseMinifig(list, 'sw0002', 'sw0002a'), list)
})

test('buildCollection inherits timelines and appearances except from Seasonal sets', () => {
  const inherited = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [setWith(1, 0)],
  })
  const seasonal = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [setWith(1, 0, ['Seasonal'])],
  })

  assert.deepEqual(inherited.minifigsList[0].timelines, ['Original'])
  assert.deepEqual(inherited.minifigsList[0].appearances, ['A New Hope'])
  assert.deepEqual(seasonal.minifigsList[0].timelines, [])
  assert.deepEqual(seasonal.minifigsList[0].appearances, [])
})

test('buildCollection refreshes the character names on set content', () => {
  const { setsList } = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [setWith(1, 0)],
  })

  assert.equal(setsList[0].content.minifigs[0].characterName, 'Name sw0001')
})

test.for([
  { exitDate: '2025-12-31', retired: false, expected: true },
  { exitDate: '2028-12-31', retired: true, expected: false },
  { exitDate: null, retired: true, expected: true },
  { exitDate: null, retired: false, expected: false },
])(
  'exit date $exitDate with retired flag $retired is retired: $expected',
  ({ expected, ...set }) => {
    assert.equal(isSetRetired(set, '2026-06-15'), expected)
  }
)
