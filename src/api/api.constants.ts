export const queryKeys = {
  bricksetIgnoreList: 'bricksetIgnoreList',
  looseMinifigs: 'looseMinifigs',
  minifigs: 'minifigs',
  resaleSets: 'resaleSets',
  sets: 'sets',
  tags: 'tags',
} as const

const dataSuffix = import.meta.env.VITE_DATA_SUFFIX ?? ''

export const endPoints = {
  bricksetIgnoreList: '/bricksetIgnoreList.json',
  looseMinifigs: '/looseMinifigs.json',
  minifigs: `/minifigs${dataSuffix}.json`,
  resaleSets: '/resaleSets.json',
  sets: `/sets${dataSuffix}.json`,
  tags: `/tags${dataSuffix}.json`,
} as const
