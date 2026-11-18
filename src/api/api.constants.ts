export const queryKeys = {
  bricksetIgnoreList: 'bricksetIgnoreList',
  looseMinifigs: 'looseMinifigs',
  minifigs: 'minifigs',
  resaleSets: 'resaleSets',
  sets: 'sets',
  tags: 'tags',
  timeline: 'timeline',
} as const

const node = (name: string) =>
  `/${name}${import.meta.env.VITE_DATA_SUFFIX ?? ''}.json`

export const endPoints = {
  bricksetIgnoreList: node('bricksetIgnoreList'),
  looseMinifigs: node('looseMinifigs'),
  minifigs: node('minifigs'),
  resaleSets: node('resaleSets'),
  sets: node('sets'),
  tags: node('tags'),
  timeline: node('timeline'),
} as const
