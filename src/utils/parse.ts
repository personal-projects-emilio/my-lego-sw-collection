export const parseInteger = (value: string) => parseInt(value, 10)

export const parseNullableNumber = (value: string) =>
  value === '' ? null : parseFloat(value)

export const parseNullableText = (value: string) => value || null

export const parseSetId = (value: string) =>
  /\D/.test(value) ? value : parseInteger(value)
