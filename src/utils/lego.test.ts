/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { SetsList } from 'types/sets'

import { renameMinifigInSets } from './lego.ts'

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
