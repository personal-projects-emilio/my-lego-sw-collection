export const spreadArrayIf = <Item = unknown>({
  condition,
  array,
}: {
  condition: boolean
  array: Item[]
}): Item[] => (condition ? array : [])

export const uniqueAndSortedArray = <Item>({
  array,
  compareFunction,
}: {
  array: Item[]
  compareFunction?: (a: Item, b: Item) => number
}) => [...new Set(array)].sort(compareFunction)

/** Orders ids like 3219 < 10188 < XWING-1, whether stored as numbers or strings. */
export const compareIds = (a: unknown, b: unknown) =>
  String(a).localeCompare(String(b), undefined, { numeric: true })
