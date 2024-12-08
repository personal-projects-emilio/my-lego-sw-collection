import type { Minifig } from 'types/minifigs'

export const defaultMinifigFormValues = {
  appearances: [],
  characterName: '',
  id: '',
  name: '',
  possessed: false,
  tags: [],
  timelines: [],
  owned: {
    inSet: [],
    loose: {
      isInFrame: false,
      quantity: 0,
    },
    total: 0,
  },
} satisfies Minifig
