/// <reference types="node" />
import assert from 'node:assert/strict'
import type { Set } from 'types/sets'
import { test } from 'vitest'

import {
  bricksetRowToSetId,
  buildBricksetReport,
  changeKey,
  newSetFromBricksetRow,
  skipChanges,
} from './brickset.ts'

const set = (id: Set['id'], overrides: Partial<Set> = {}) =>
  ({
    id,
    name: `Set ${id}`,
    releaseYear: 2020,
    bricksetImagePath: null,
    EAN: null,
    UPC: null,
    prices: {
      bought: 10,
      marketValue: 0,
      storeValue: 0,
      brickLinkSoldPriceNew: 0,
      brickLinkSoldPriceUsed: 0,
    },
    dimensions: {
      model: { width: null, height: null, depth: null },
      box: { width: null, height: null, depth: null },
    },
    ...overrides,
  }) as Set

const row = (fields: Record<string, string>) => ({
  Number: '',
  Variant: '1',
  USItemNumber: '',
  Theme: 'Star Wars',
  Subtheme: 'Episode IV',
  ...fields,
})

test('sorts rows into updates, unchanged, missing, ignored, not in CSV and conflicts', () => {
  const setsList = [
    set(75192),
    set('75300', { releaseYear: 2021, dimensions: undefined }),
    set(10331),
    set(75000),
    set(75001),
  ]
  const report = buildBricksetReport({
    setsList,
    ignoreList: { ids: ['10331'], themes: ['Ideas'], subthemes: [] },
    rows: [
      row({ Number: '75192', YearFrom: '2017', Width: '58.5', EAN: '' }),
      row({ Number: '75300', YearFrom: '2021' }),
      row({ Number: '10331' }),
      row({ Number: '21300', Theme: 'Ideas' }),
      row({ Number: '75999' }),
      row({ Number: '75001' }),
      row({ Number: '75001', Variant: '2' }),
    ],
  })

  assert.deepEqual(
    report.updates.map(({ set, changes }) => [set.id, changes]),
    [
      [
        75192,
        [
          { field: 'releaseYear', from: 2020, to: 2017 },
          { field: 'dimensions.box.width', from: null, to: 58.5 },
        ],
      ],
    ]
  )
  assert.equal(report.unchangedCount, 1)
  assert.deepEqual(
    report.missing.map(({ Number }) => Number),
    ['75999']
  )
  assert.deepEqual(
    report.ignored.map(({ row, reason }) => [row.Number, reason]),
    [
      ['10331', 'id'],
      ['21300', 'theme'],
    ]
  )
  assert.deepEqual(
    report.notInCsv.map(({ id }) => id),
    [75000]
  )
  assert.deepEqual(
    report.conflicts.map(({ id }) => id),
    [75001]
  )
  assert.equal(report.setsList.length, setsList.length)
  assert.equal(report.setsList[0].releaseYear, 2017)
  assert.equal(report.setsList[0].EAN, null)
})

test('builds a new owned set from a Brickset row', () => {
  const base = set('')
  const newSet = newSetFromBricksetRow(
    row({
      Number: '5006290',
      SetName: "Yoda's Lightsaber",
      Subtheme: 'Promotional',
      YearFrom: '2020',
      Pieces: '140',
      QtyOwned: '1',
      ImageFilename: '5006290-1',
    }),
    {
      ...base,
      content: {
        minifigs: [],
        bags: null,
        box: null,
        notice: null,
        partsQuantity: 0,
      },
    },
    5006290
  )

  assert.equal(newSet.id, 5006290)
  assert.equal(newSet.name, "Yoda's Lightsaber")
  assert.equal(newSet.subtheme, 'Promotional')
  assert.equal(newSet.releaseYear, 2020)
  assert.equal(newSet.possessed, true)
  assert.equal(newSet.ownedQuantity, 1)
  assert.equal(newSet.content.partsQuantity, 140)
  assert.equal(
    newSet.bricksetImagePath,
    'https://images.brickset.com/sets/images/5006290-1.jpg'
  )
})

test('only keeps the variant suffix when another variant exists', () => {
  const rows = [
    row({ Number: '75466' }),
    row({ Number: 'XWING', Variant: '1' }),
    row({ Number: 'XWING', Variant: '2' }),
    row({ Number: '7140' }),
  ]
  const setsList = [set('7140-2')]
  const idOf = (index: number) =>
    bricksetRowToSetId(rows[index], { rows, setsList })

  assert.equal(idOf(0), 75466)
  assert.equal(idOf(1), 'XWING-1')
  assert.equal(idOf(2), 'XWING-2')
  assert.equal(idOf(3), '7140-1')
})

test('matches a set stored under its EU item number', () => {
  const report = buildBricksetReport({
    setsList: [set(6346098)],
    ignoreList: { ids: [], themes: [], subthemes: [] },
    rows: [
      row({ Number: '5006290', EUItemNumber: '6346098', YearFrom: '2021' }),
    ],
  })

  assert.deepEqual(report.missing, [])
  assert.deepEqual(
    report.updates.map(({ set }) => set.id),
    [6346098]
  )
})

test('reads the exit date and piece count, and puts back skipped changes', () => {
  const report = buildBricksetReport({
    setsList: [
      set(75192, {
        content: {
          minifigs: [],
          bags: null,
          box: null,
          notice: null,
          partsQuantity: 7541,
        },
      }),
    ],
    ignoreList: { ids: [], themes: [], subthemes: [] },
    rows: [
      row({
        Number: '75192',
        YearFrom: '2020',
        ExitDate: '31/12/2028 00:00:00',
        Pieces: '7500',
        BrickLinkSoldPriceNew: '800',
      }),
    ],
  })

  assert.deepEqual(report.updates[0].changes, [
    { field: 'exitDate', from: undefined, to: '2028-12-31' },
    { field: 'content.partsQuantity', from: 7541, to: 7500 },
    { field: 'prices.brickLinkSoldPriceNew', from: 0, to: 800 },
  ])

  const [saved] = skipChanges(report, [
    changeKey(75192, 'content.partsQuantity'),
  ])
  assert.equal(saved.content.partsQuantity, 7541)
  assert.equal(saved.exitDate, '2028-12-31')
  assert.equal(saved.prices.brickLinkSoldPriceNew, 800)
  assert.equal(saved.prices.bought, 10)
})
