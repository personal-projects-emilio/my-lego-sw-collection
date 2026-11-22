import type { ColumnTotal } from 'types/totalRow'

export const buildTotalContext = <TData>(total: ColumnTotal<TData>) => ({
  total,
})
