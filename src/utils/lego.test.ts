/// <reference types="node" />
import assert from 'node:assert/strict'
import type { LooseMinifig } from 'types/minifigs'
import type { TagsList } from 'types/tags'
import type { TimelineList } from 'types/timeline'
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
import {
  minifigFixture,
  setFixture,
  setMinifigFixture,
} from './testFixtures.ts'

test('renames a minifig in every set that contains it', () => {
  const minifig = { characterName: 'Han Solo', quantity: 1, isInFrame: false }
  const setsList = [
    setFixture({
      id: 1,
      content: { minifigs: [setMinifigFixture({ ...minifig, id: 'sw0001' })] },
    }),
    setFixture({
      id: 2,
      content: { minifigs: [setMinifigFixture({ ...minifig, id: 'sw0002' })] },
    }),
  ]

  const renamed = renameMinifigInSets({
    setsList,
    previousId: 'sw0001',
    newId: 'sw0001a',
  })

  assert.equal(renamed[0].content.minifigs[0].id, 'sw0001a')
  assert.equal(renamed[1], setsList[1])
})

const minifig = ({
  id,
  tags = [],
  timeline = [],
}: {
  id: string
  tags?: string[]
  timeline?: string[]
}) => minifigFixture({ id, tags, timeline })

const loose = (quantity: number): LooseMinifig => ({
  quantity,
  isInFrame: false,
  unitBoughtPrice: 2,
  unitMarketValue: 5,
})

const setWith = ({
  id,
  ownedQuantity,
  tags = [],
  timeline = [],
}: {
  id: number
  ownedQuantity: number
  tags?: string[]
  timeline?: string[]
}) =>
  setFixture({
    id,
    ownedQuantity,
    tags,
    timeline,
    content: {
      minifigs: [
        setMinifigFixture({
          id: 'sw0001',
          characterName: 'Old name',
          quantity: 2,
          isInFrame: true,
        }),
      ],
    },
  })

test('buildCollection adds owned set quantities to the loose total and lists every set', () => {
  const { minifigsList } = buildCollection({
    minifigsList: [minifig({ id: 'sw0001' })],
    looseMinifigsList: [{ id: 'sw0001', ...loose(1) }],
    setsList: [
      setWith({ id: 1, ownedQuantity: 1 }),
      setWith({ id: 2, ownedQuantity: 0 }),
    ],
    tagsList: [],
    timelineList: [],
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
    minifigsList: [minifig({ id: 'sw0001' })],
    looseMinifigsList: [{ id: 'sw0001', ...loose(1) }],
    setsList: [setWith({ id: 1, ownedQuantity: 2 })],
    tagsList: [],
    timelineList: [],
  })

  assert.equal(minifigsList[0].owned.total, 5)
})

test('buildCollection gives a minifig without a loose entry an empty loose', () => {
  const { minifigsList } = buildCollection({
    minifigsList: [minifig({ id: 'sw0001' })],
    looseMinifigsList: [],
    setsList: [],
    tagsList: [],
    timelineList: [],
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

  assert.deepEqual(
    updateLooseMinifig({
      looseMinifigsList: list,
      minifigId: id,
      changes: { quantity },
    }),
    expected
  )
})

test('renameLooseMinifig moves the entry to the new id', () => {
  const list = [{ id: 'sw0001', ...loose(1) }]

  assert.deepEqual(
    renameLooseMinifig({
      looseMinifigsList: list,
      previousId: 'sw0001',
      newId: 'sw0001a',
    }),
    [{ id: 'sw0001a', ...loose(1) }]
  )
  assert.equal(
    renameLooseMinifig({
      looseMinifigsList: list,
      previousId: 'sw0002',
      newId: 'sw0002a',
    }),
    list
  )
})

const tagsList: TagsList = [
  {
    id: 'saga',
    label: 'Saga',
    appliesTo: 'both',
    inherited: true,
  },
  {
    id: 'age-of-rebellion',
    label: 'Age of Rebellion',
    parent: 'saga',
  },
  {
    id: 'original-trilogy',
    label: 'Original Trilogy',
    parent: 'age-of-rebellion',
  },
  {
    id: 'a-new-hope',
    label: 'A New Hope',
    parent: 'original-trilogy',
  },
  { id: 'affiliation', label: 'Affiliation', appliesTo: 'both' },
  {
    id: 'rebel-alliance',
    label: 'Rebel Alliance',
    parent: 'affiliation',
  },
  { id: 'product-type', label: 'Product Type', appliesTo: 'both' },
  { id: 'seasonal', label: 'Seasonal', parent: 'product-type' },
  { id: 'vehicle', label: 'Vehicle', appliesTo: 'sets' },
  { id: 'x-wing', label: 'X-wing', parent: 'vehicle' },
]

const eraOf = ['age-of-rebellion', 'original-trilogy', 'a-new-hope']

test.for([
  {
    case: 'a set implies the ancestors of its tags except the root',
    sets: [{ id: 1, owned: 1, tags: ['a-new-hope'] }],
    minifigTags: [],
    expected: {
      setEffectiveTags: eraOf,
      effectiveTags: eraOf,
      inheritedTags: {
        'age-of-rebellion': [1],
        'original-trilogy': [1],
        'a-new-hope': [1],
      },
      tags: [],
    },
  },
  {
    case: 'a minifig inherits only the tags under inherited roots',
    sets: [{ id: 1, owned: 1, tags: ['a-new-hope', 'rebel-alliance'] }],
    minifigTags: [],
    expected: {
      setEffectiveTags: ['rebel-alliance', ...eraOf],
      effectiveTags: eraOf,
      inheritedTags: {
        'age-of-rebellion': [1],
        'original-trilogy': [1],
        'a-new-hope': [1],
      },
      tags: [],
    },
  },
  {
    case: 'a seasonal set passes nothing on',
    sets: [{ id: 1, owned: 1, tags: ['a-new-hope', 'seasonal'] }],
    minifigTags: [],
    expected: {
      setEffectiveTags: ['seasonal', ...eraOf],
      effectiveTags: [],
      inheritedTags: {},
      tags: [],
    },
  },
  {
    case: 'an unowned set passes its tags on and every source set is listed',
    sets: [
      { id: 1, owned: 0, tags: ['a-new-hope'] },
      { id: 2, owned: 1, tags: ['original-trilogy'] },
    ],
    minifigTags: [],
    expected: {
      setEffectiveTags: eraOf,
      effectiveTags: eraOf,
      inheritedTags: {
        'age-of-rebellion': [1, 2],
        'original-trilogy': [1, 2],
        'a-new-hope': [1],
      },
      tags: [],
    },
  },
  {
    case: 'a hand-picked tag a set also provides counts once and lists the set',
    sets: [{ id: 1, owned: 1, tags: ['a-new-hope'] }],
    minifigTags: ['a-new-hope', 'rebel-alliance'],
    expected: {
      setEffectiveTags: eraOf,
      effectiveTags: ['rebel-alliance', ...eraOf],
      inheritedTags: {
        'age-of-rebellion': [1],
        'original-trilogy': [1],
        'a-new-hope': [1],
      },
      tags: ['a-new-hope', 'rebel-alliance'],
    },
  },
  {
    case: 'a hand-picked minifig tag implies its parents',
    sets: [{ id: 1, owned: 1, tags: [] }],
    minifigTags: ['a-new-hope'],
    expected: {
      setEffectiveTags: [],
      effectiveTags: eraOf,
      inheritedTags: {},
      tags: ['a-new-hope'],
    },
  },
  {
    case: 'a set listing the minifig twice is listed once as a source',
    sets: [{ id: 1, owned: 1, tags: ['a-new-hope'], copies: 2 }],
    minifigTags: [],
    expected: {
      setEffectiveTags: eraOf,
      effectiveTags: eraOf,
      inheritedTags: {
        'age-of-rebellion': [1],
        'original-trilogy': [1],
        'a-new-hope': [1],
      },
      tags: [],
    },
  },
  {
    case: 'a stored tag under a root for the other item type is ignored',
    sets: [{ id: 1, owned: 1, tags: ['x-wing'] }],
    minifigTags: ['x-wing'],
    expected: {
      setEffectiveTags: ['x-wing'],
      effectiveTags: [],
      inheritedTags: {},
      tags: ['x-wing'],
    },
  },
])('buildCollection: $case', ({ sets, minifigTags, expected }) => {
  const { setsList, minifigsList } = buildCollection({
    minifigsList: [minifig({ id: 'sw0001', tags: minifigTags })],
    looseMinifigsList: [],
    setsList: sets.map((row) => {
      const set = setWith({
        id: row.id,
        ownedQuantity: row.owned,
        tags: row.tags,
      })
      const copies = 'copies' in row ? row.copies : 1
      return {
        ...set,
        content: {
          ...set.content,
          minifigs: Array.from(
            { length: copies },
            () => set.content.minifigs[0]
          ),
        },
      }
    }),
    tagsList,
    timelineList: [],
  })

  assert.deepEqual(setsList[0].effectiveTags, expected.setEffectiveTags)
  assert.deepEqual(
    {
      effectiveTags: minifigsList[0].effectiveTags,
      inheritedTags: minifigsList[0].inheritedTags,
      tags: minifigsList[0].tags,
    },
    {
      effectiveTags: expected.effectiveTags,
      inheritedTags: expected.inheritedTags,
      tags: expected.tags,
    }
  )
})

const timelineList: TimelineList = [
  { id: 'holiday-special', label: 'Holiday Special', kind: 'other' },
  { id: 'age-of-rebellion', label: 'Age of Rebellion', start: 0, end: 5 },
  {
    id: 'original-trilogy',
    label: 'Original Trilogy',
    parent: 'age-of-rebellion',
  },
  {
    id: 'return-of-the-jedi',
    label: 'Return of the Jedi',
    parent: 'original-trilogy',
    kind: 'movie',
    start: 4,
    end: 4,
  },
  {
    id: 'a-new-hope',
    label: 'A New Hope',
    parent: 'original-trilogy',
    kind: 'movie',
    start: 0,
    end: 0,
  },
  {
    id: 'reign-of-the-empire',
    label: 'Reign of the Empire',
    start: -19,
    end: 0,
  },
  {
    id: 'rogue-one',
    label: 'Rogue One',
    parent: 'reign-of-the-empire',
    kind: 'movie',
    start: 0,
    end: 0,
  },
  {
    id: 'andor',
    label: 'Andor',
    parent: 'reign-of-the-empire',
    kind: 'show',
    start: -5,
    end: 0,
  },
  {
    id: 'rebels',
    label: 'Rebels',
    parent: 'reign-of-the-empire',
    kind: 'show',
    start: -5,
    end: -1,
  },
]

const ot = ['age-of-rebellion', 'original-trilogy']

test.for([
  {
    case: 'a set implies the trilogy and era of its titles',
    sets: [{ id: 1, tags: [], timeline: ['a-new-hope'] }],
    minifigTimeline: [],
    expected: {
      setEffective: [...ot, 'a-new-hope'],
      effective: [...ot, 'a-new-hope'],
      inherited: {
        'age-of-rebellion': [1],
        'original-trilogy': [1],
        'a-new-hope': [1],
      },
      stored: [],
    },
  },
  {
    case: 'entries sort by start, then end, then label, undated last',
    sets: [
      {
        id: 1,
        tags: [],
        timeline: [
          'holiday-special',
          'return-of-the-jedi',
          'a-new-hope',
          'rogue-one',
          'andor',
          'rebels',
        ],
      },
    ],
    minifigTimeline: [],
    expected: {
      setEffective: [
        'reign-of-the-empire',
        'rebels',
        'andor',
        'rogue-one',
        ...ot,
        'a-new-hope',
        'return-of-the-jedi',
        'holiday-special',
      ],
      effective: [
        'reign-of-the-empire',
        'rebels',
        'andor',
        'rogue-one',
        ...ot,
        'a-new-hope',
        'return-of-the-jedi',
        'holiday-special',
      ],
      inherited: {
        'reign-of-the-empire': [1],
        rebels: [1],
        andor: [1],
        'rogue-one': [1],
        'age-of-rebellion': [1],
        'original-trilogy': [1],
        'a-new-hope': [1],
        'return-of-the-jedi': [1],
        'holiday-special': [1],
      },
      stored: [],
    },
  },
  {
    case: 'a seasonal set passes no timeline on',
    sets: [{ id: 1, tags: ['seasonal'], timeline: ['a-new-hope'] }],
    minifigTimeline: [],
    expected: {
      setEffective: [...ot, 'a-new-hope'],
      effective: [],
      inherited: {},
      stored: [],
    },
  },
  {
    case: 'every set containing the minifig is listed as a source',
    sets: [
      { id: 1, tags: [], timeline: ['a-new-hope'] },
      { id: 2, tags: [], timeline: ['return-of-the-jedi'] },
    ],
    minifigTimeline: [],
    expected: {
      setEffective: [...ot, 'a-new-hope'],
      effective: [...ot, 'a-new-hope', 'return-of-the-jedi'],
      inherited: {
        'age-of-rebellion': [1, 2],
        'original-trilogy': [1, 2],
        'a-new-hope': [1],
        'return-of-the-jedi': [2],
      },
      stored: [],
    },
  },
  {
    case: 'a hand-picked entry a set also provides stays stored',
    sets: [{ id: 1, tags: [], timeline: ['a-new-hope'] }],
    minifigTimeline: ['a-new-hope', 'andor'],
    expected: {
      setEffective: [...ot, 'a-new-hope'],
      effective: ['reign-of-the-empire', 'andor', ...ot, 'a-new-hope'],
      inherited: {
        'age-of-rebellion': [1],
        'original-trilogy': [1],
        'a-new-hope': [1],
      },
      stored: ['a-new-hope', 'andor'],
    },
  },
])('buildCollection timeline: $case', ({ sets, minifigTimeline, expected }) => {
  const { setsList, minifigsList } = buildCollection({
    minifigsList: [minifig({ id: 'sw0001', timeline: minifigTimeline })],
    looseMinifigsList: [],
    setsList: sets.map((row) =>
      setWith({
        id: row.id,
        ownedQuantity: 1,
        tags: row.tags,
        timeline: row.timeline,
      })
    ),
    tagsList,
    timelineList,
  })

  assert.deepEqual(
    {
      setEffective: setsList[0].effectiveTimeline,
      effective: minifigsList[0].effectiveTimeline,
      inherited: minifigsList[0].inheritedTimeline,
      stored: minifigsList[0].timeline,
    },
    expected
  )
})

test('buildCollection refreshes the character names on set content', () => {
  const { setsList } = buildCollection({
    minifigsList: [minifig({ id: 'sw0001' })],
    looseMinifigsList: [],
    setsList: [setWith({ id: 1, ownedQuantity: 0 })],
    tagsList: [],
    timelineList: [],
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
    assert.equal(isSetRetired({ ...set, today: '2026-06-15' }), expected)
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
      totalBought: 240,
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
      totalBought: 240,
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
      totalBought: 0,
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
      totalBought: 240,
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
      discount: 2 / 7,
      totalBought: 250,
      unitSellingPrice: 125,
      quantitySold: 2,
      unitProfit: 50,
      profitPercentage: 0.8,
      totalSold: 250,
      totalProfit: 100,
    }
  )
})

test('getResaleTotals computes discount and profit % from the averages', () => {
  const totals = getResaleTotals([
    { ...resale, officialPrice: 100, unitBoughtPrice: 75 },
    { ...resale, officialPrice: null, unitBoughtPrice: 25 },
  ])

  assert.deepEqual(
    {
      officialPrice: totals.officialPrice,
      unitBoughtPrice: totals.unitBoughtPrice,
      discount: totals.discount,
      profitPercentage: totals.profitPercentage,
    },
    {
      officialPrice: 100,
      unitBoughtPrice: 50,
      discount: 0.5,
      profitPercentage: 1.4,
    }
  )
})

test('getResaleTotals leaves averages and profit % empty without values', () => {
  assert.deepEqual(getResaleTotals([]), {
    officialPrice: null,
    quantityBought: 0,
    unitBoughtPrice: null,
    discount: null,
    totalBought: 0,
    unitSellingPrice: null,
    quantitySold: 0,
    unitProfit: null,
    profitPercentage: null,
    totalSold: 0,
    totalProfit: 0,
  })
})
