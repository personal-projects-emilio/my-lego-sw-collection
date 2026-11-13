/// <reference types="node" />
import assert from 'node:assert/strict'
import type { LooseMinifig, Minifig } from 'types/minifigs'
import type { Set, SetsList } from 'types/sets'
import { test } from 'vitest'

import {
  buildCollection,
  getResaleTotals,
  getResaleValues,
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
    { setId: 1, quantity: 2, isInFrame: true, setOwnedQuantity: 1 },
    { setId: 2, quantity: 2, isInFrame: true, setOwnedQuantity: 0 },
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

const resale = {
  officialPrice: 100,
  unitBoughtPrice: 80,
  unitSellingPrice: 120,
  quantityBought: 3,
  quantitySold: 2,
}

test.for([
  {
    case: 'worked example',
    changes: {},
    expected: {
      discount: 0.2,
      unitProfit: 40,
      profitPercentage: 0.5,
      totalSold: 240,
      totalProfit: 80,
    },
  },
  {
    case: 'missing official price leaves the discount empty',
    changes: { officialPrice: null },
    expected: {
      discount: null,
      unitProfit: 40,
      profitPercentage: 0.5,
      totalSold: 240,
      totalProfit: 80,
    },
  },
  {
    case: 'bought price of 0 leaves the profit % empty',
    changes: { unitBoughtPrice: 0 },
    expected: {
      discount: 1,
      unitProfit: 120,
      profitPercentage: null,
      totalSold: 240,
      totalProfit: 240,
    },
  },
  {
    case: 'missing sell price leaves every sale value empty',
    changes: { unitSellingPrice: null },
    expected: {
      discount: 0.2,
      unitProfit: null,
      profitPercentage: null,
      totalSold: null,
      totalProfit: null,
    },
  },
])('getResaleValues $case', ({ changes, expected }) => {
  assert.deepEqual(getResaleValues({ ...resale, ...changes }), expected)
})

test('getResaleTotals sums total sold and total profit, skipping empty values', () => {
  const { totalSold, totalProfit } = getResaleTotals([
    resale,
    { ...resale, unitSellingPrice: 100, quantitySold: 1 },
    { ...resale, unitSellingPrice: null },
  ])

  assert.deepEqual(
    { totalSold, totalProfit },
    { totalSold: 340, totalProfit: 100 }
  )
})

test('getResaleTotals averages unit values per unit bought and sums quantities', () => {
  assert.deepEqual(
    getResaleTotals([
      {
        officialPrice: 100,
        unitBoughtPrice: 75,
        unitSellingPrice: 125,
        quantityBought: 3,
        quantitySold: 2,
      },
      {
        officialPrice: 50,
        unitBoughtPrice: 25,
        unitSellingPrice: null,
        quantityBought: 1,
        quantitySold: 0,
      },
    ]),
    {
      officialPrice: 87.5,
      quantityBought: 4,
      unitBoughtPrice: 62.5,
      discount: 0.3125,
      unitSellingPrice: 125,
      quantitySold: 2,
      unitProfit: 50,
      profitPercentage: 2 / 3,
      totalSold: 250,
      totalProfit: 100,
    }
  )
})

test('getResaleTotals leaves averages and profit % empty without values', () => {
  assert.deepEqual(getResaleTotals([]), {
    officialPrice: null,
    quantityBought: 0,
    unitBoughtPrice: null,
    discount: null,
    unitSellingPrice: null,
    quantitySold: 0,
    unitProfit: null,
    profitPercentage: null,
    totalSold: 0,
    totalProfit: 0,
  })
})
