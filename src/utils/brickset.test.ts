/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Set } from 'types/sets'

import { buildBricksetReport } from './brickset.ts'

const set = (id: Set['id'], overrides: Partial<Set> = {}) =>
  ({
    id,
    name: `Set ${id}`,
    releaseYear: 2020,
    imagePath: null,
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
      model: { width: 0, height: 0, depth: 0 },
      box: { width: 0, height: 0, depth: 0 },
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
    set('75300', { releaseYear: 2021 }),
    set(10331),
    set(75000),
    set(75001),
  ]
  const report = buildBricksetReport({
    setsList,
    ignoreList: { numbers: ['10331'], themes: ['Ideas'], subthemes: [] },
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
          { field: 'dimensions.box.width', from: 0, to: 58.5 },
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
      ['10331', 'number'],
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
