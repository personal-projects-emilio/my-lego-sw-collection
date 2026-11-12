export const spreadArrayIf = <T = unknown>(
  condition: boolean,
  array: T[]
): T[] => (condition ? array : [])

export const uniqueAndSortedArray = <T>(
  array: T[],
  compareFunction?: (a: T, b: T) => number
) => [...new Set(array)].sort(compareFunction)

/** Orders ids like 3219 < 10188 < XWING-1, whether stored as numbers or strings. */
export const compareIds = (a: unknown, b: unknown) =>
  String(a).localeCompare(String(b), undefined, { numeric: true })
