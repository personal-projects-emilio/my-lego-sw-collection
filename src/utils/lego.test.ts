/// <reference types="node" />
import assert from 'node:assert/strict'
import type { LooseMinifig, Minifig } from 'types/minifigs'
import type { Set, SetsList } from 'types/sets'
import { test } from 'vitest'

import {
  buildCollection,
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
    possessed: false,
    timelines: [],
    appearances: [],
  }) as unknown as Minifig

const loose = (quantity: number): LooseMinifig => ({
  quantity,
  isInFrame: false,
  unitBoughtPrice: 2,
  unitMarketValue: 5,
})

const setWith = (id: number, possessed: boolean, tags: string[] = []) =>
  ({
    id,
    possessed,
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

test('buildCollection adds possessed set quantities to the loose total and lists every set', () => {
  const { minifigsList } = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [{ id: 'sw0001', ...loose(1) }],
    setsList: [setWith(1, true), setWith(2, false)],
  })

  assert.equal(minifigsList[0].owned.total, 3)
  assert.deepEqual(minifigsList[0].owned.loose, loose(1))
  assert.deepEqual(minifigsList[0].owned.inSet, [
    { setId: 1, quantity: 2, isInFrame: true, possessed: true },
    { setId: 2, quantity: 2, isInFrame: true, possessed: false },
  ])
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

test('updateLooseMinifig merges changes, keeps the list sorted and drops the entry at quantity 0', () => {
  const list = [{ id: 'sw0002', ...loose(1) }]

  assert.deepEqual(updateLooseMinifig(list, 'sw0002', { quantity: 3 }), [
    { id: 'sw0002', ...loose(3) },
  ])
  assert.deepEqual(updateLooseMinifig(list, 'sw0001', { quantity: 1 }), [
    { id: 'sw0001', ...loose(1), unitBoughtPrice: 0, unitMarketValue: 0 },
    { id: 'sw0002', ...loose(1) },
  ])
  assert.deepEqual(updateLooseMinifig(list, 'sw0002', { quantity: 0 }), [])
})

test('renameLooseMinifig moves the entry to the new id', () => {
  const list = [{ id: 'sw0001', ...loose(1) }]

  assert.deepEqual(renameLooseMinifig(list, 'sw0001', 'sw0001a'), [
    { id: 'sw0001a', ...loose(1) },
  ])
  assert.equal(renameLooseMinifig(list, 'sw0002', 'sw0002a'), list)
})

test('buildCollection marks a minifig possessed through a possessed set only', () => {
  const possessed = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [setWith(1, true)],
  })
  const notPossessed = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [setWith(1, false)],
  })

  assert.equal(possessed.minifigsList[0].possessed, true)
  assert.equal(notPossessed.minifigsList[0].possessed, false)
})

test('buildCollection inherits timelines and appearances except from Seasonal sets', () => {
  const inherited = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [setWith(1, false)],
  })
  const seasonal = buildCollection({
    minifigsList: [minifig('sw0001')],
    looseMinifigsList: [],
    setsList: [setWith(1, false, ['Seasonal'])],
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
    setsList: [setWith(1, false)],
  })

  assert.equal(setsList[0].content.minifigs[0].characterName, 'Name sw0001')
})
