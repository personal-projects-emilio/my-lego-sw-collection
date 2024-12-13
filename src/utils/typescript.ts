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
