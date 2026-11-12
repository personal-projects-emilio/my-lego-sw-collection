/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { parseCsv } from './csv.ts'

test('parses a BOM, CRLF lines, quoted commas, multi-line fields and escaped quotes', () => {
  const csv =
    String.fromCharCode(0xfeff) +
    'Number,Name,Notes\r\n75192,"Millennium Falcon, UCS","Line 1\r\nLine 2"\r\n75300,"The ""Imperial"" TIE",\r\n\r\n'
  assert.deepEqual(parseCsv(csv), [
    {
      Number: '75192',
      Name: 'Millennium Falcon, UCS',
      Notes: 'Line 1\r\nLine 2',
    },
    { Number: '75300', Name: 'The "Imperial" TIE', Notes: '' },
  ])
})
