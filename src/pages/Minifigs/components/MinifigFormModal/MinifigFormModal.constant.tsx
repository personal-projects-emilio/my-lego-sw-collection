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
    loose: {
      isInFrame: false,
      quantity: 0,
    },
  },
} satisfies Minifig
