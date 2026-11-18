import { describe, expect, test } from 'vitest'

import {
  parseInteger,
  parseNullableNumber,
  parseNullableText,
  parseSetId,
} from './parse'

describe('parseInteger', () => {
  test.for([
    { value: '42', expected: 42 },
    { value: '42.9', expected: 42 },
    { value: '007', expected: 7 },
    { value: '', expected: NaN },
  ])('$value gives $expected', ({ value, expected }) => {
    expect(parseInteger(value)).toBe(expected)
  })
})

describe('parseNullableNumber', () => {
  test.for([
    { value: '12.5', expected: 12.5 },
    { value: '0', expected: 0 },
    { value: '', expected: null },
  ])('$value gives $expected', ({ value, expected }) => {
    expect(parseNullableNumber(value)).toBe(expected)
  })
})

describe('parseNullableText', () => {
  test.for([
    { value: '2024-01-31', expected: '2024-01-31' },
    { value: '', expected: null },
  ])('$value gives $expected', ({ value, expected }) => {
    expect(parseNullableText(value)).toBe(expected)
  })
})

describe('parseSetId', () => {
  test.for([
    { value: '75000', expected: 75000 },
    { value: '75000-1', expected: '75000-1' },
    { value: 'sw-promo', expected: 'sw-promo' },
    { value: '', expected: NaN },
  ])('$value gives $expected', ({ value, expected }) => {
    expect(parseSetId(value)).toBe(expected)
  })
})
