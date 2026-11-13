import type { StoredLooseMinifig } from 'types/minifigs'

export const defaultLooseMinifigFormValues = {
  id: '',
  quantity: 1,
  isInFrame: false,
  unitBoughtPrice: 0,
  unitMarketValue: 0,
} satisfies StoredLooseMinifig
