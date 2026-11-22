export function assert(
  condition: unknown,
  errorMessage?: string
): asserts condition {
  if (condition === false) throw new Error(errorMessage)
}

export function isNotNullOrUndefined<Value = unknown>(
  value: Value
): value is NonNullable<Value> {
  return value !== null && value !== undefined
}

export const removeUndefined = <Item extends object>(item: Item): Item => {
  const copy = { ...item }
  Object.keys(copy).forEach((key) => {
    if (Reflect.get(copy, key) === undefined) Reflect.deleteProperty(copy, key)
  })
  return copy
}
