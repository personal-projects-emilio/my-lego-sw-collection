import type { Minifig } from 'types/minifigs'

export const defaultMinifigFormValues = {
  appearances: [],
  characterName: '',
  id: '',
  name: '',
  possessed: false,
  tags: [],
  timelines: [],
} satisfies Minifig
