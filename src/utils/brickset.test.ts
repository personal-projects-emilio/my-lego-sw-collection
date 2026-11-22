/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'vitest'

import {
  buildBricksetReport,
  createSetFromBricksetRow,
  getChangeKey,
  getSetIdFromBricksetRow,
  skipChanges,
} from './brickset.ts'
import { setFixture } from './testFixtures.ts'

const set = (overrides: Parameters<typeof setFixture>[0]) =>
  setFixture({
    prices: {
      bought: 10,
      marketValue: 0,
      storeValue: 0,
      brickLinkSoldPriceNew: 0,
      brickLinkSoldPriceUsed: 0,
    },
    ...overrides,
  })

const buildRow = (fields: Record<string, string>) => ({
  Number: '',
  Variant: '1',
  USItemNumber: '',
  Theme: 'Star Wars',
  Subtheme: 'Episode IV',
  ...fields,
})

test('sorts rows into updates, unchanged, missing, ignored, not in CSV and conflicts', () => {
  const setsList = [
    set({ id: 75192 }),
    set({ id: '75300', releaseYear: 2021, dimensions: undefined }),
    set({ id: 10331 }),
    set({ id: 75000 }),
    set({ id: 75001 }),
  ]
  const report = buildBricksetReport({
    setsList,
    ignoreList: { ids: ['10331'], themes: ['Ideas'], subthemes: [] },
    rows: [
      buildRow({ Number: '75192', YearFrom: '2017', Width: '58.5', EAN: '' }),
      buildRow({ Number: '75300', YearFrom: '2021' }),
      buildRow({ Number: '10331' }),
      buildRow({ Number: '21300', Theme: 'Ideas' }),
      buildRow({ Number: '75999' }),
      buildRow({ Number: '75001' }),
      buildRow({ Number: '75001', Variant: '2' }),
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
  const base = set({ id: '' })
  const newSet = createSetFromBricksetRow({
    row: buildRow({
      Number: '5006290',
      SetName: "Yoda's Lightsaber",
      Subtheme: 'Promotional',
      YearFrom: '2020',
      Pieces: '140',
      QtyOwned: '1',
      ImageFilename: '5006290-1',
    }),
    base: {
      ...base,
      content: {
        minifigs: [],
        bags: null,
        box: null,
        notice: null,
        partsQuantity: 0,
      },
    },
    id: 5006290,
  })

  assert.equal(newSet.id, 5006290)
  assert.equal(newSet.name, "Yoda's Lightsaber")
  assert.equal(newSet.subtheme, 'Promotional')
  assert.equal(newSet.releaseYear, 2020)
  assert.equal(newSet.ownedQuantity, 1)
  assert.equal(newSet.content.partsQuantity, 140)
  assert.equal(
    newSet.bricksetImagePath,
    'https://images.brickset.com/sets/images/5006290-1.jpg'
  )
})

test('only keeps the variant suffix when another variant exists', () => {
  const rows = [
    buildRow({ Number: '75466' }),
    buildRow({ Number: 'XWING', Variant: '1' }),
    buildRow({ Number: 'XWING', Variant: '2' }),
    buildRow({ Number: '7140' }),
  ]
  const setsList = [set({ id: '7140-2' })]
  const getId = (index: number) =>
    getSetIdFromBricksetRow({ row: rows[index], rows, setsList })

  assert.equal(getId(0), 75466)
  assert.equal(getId(1), 'XWING-1')
  assert.equal(getId(2), 'XWING-2')
  assert.equal(getId(3), '7140-1')
})

test('matches a set stored under its EU item number', () => {
  const report = buildBricksetReport({
    setsList: [set({ id: 6346098 })],
    ignoreList: { ids: [], themes: [], subthemes: [] },
    rows: [
      buildRow({
        Number: '5006290',
        EUItemNumber: '6346098',
        YearFrom: '2021',
      }),
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
      set({
        id: 75192,
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
      buildRow({
        Number: '75192',
        YearFrom: '2020',
        ExitDate: '31/12/2028 00:00:00',
        Pieces: '7500',
        BrickLinkSoldPriceNew: '800',
      }),
    ],
  })

  assert.deepEqual(report.updates[0].changes, [
    { field: 'exitDate', from: null, to: '2028-12-31' },
    { field: 'content.partsQuantity', from: 7541, to: 7500 },
    { field: 'prices.brickLinkSoldPriceNew', from: 0, to: 800 },
  ])

  const [saved] = skipChanges({
    report,
    skippedKeys: [getChangeKey({ id: 75192, field: 'content.partsQuantity' })],
  })
  assert.equal(saved.content.partsQuantity, 7541)
  assert.equal(saved.exitDate, '2028-12-31')
  assert.equal(saved.prices.brickLinkSoldPriceNew, 800)
  assert.equal(saved.prices.bought, 10)
})
