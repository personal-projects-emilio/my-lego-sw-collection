export const spreadArrayIf = <T = unknown>(
  condition: boolean,
  array: T[]
): T[] => (condition ? array : [])
