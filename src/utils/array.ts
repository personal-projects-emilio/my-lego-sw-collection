export const spreadArrayIf = <T = unknown>(
  condition: boolean,
  array: T[]
): T[] => (condition ? array : [])

export const uniqueAndSortedArray = <T>(
  array: T[],
  compareFunction?: (a: T, b: T) => number
) => [...new Set(array)].sort(compareFunction)
