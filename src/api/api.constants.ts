import type { ColumnLayoutTarget } from 'types/columnLayout'

export const queryKeys = {
  bricksetIgnoreList: 'bricksetIgnoreList',
  columnLayout: 'columnLayout',
  looseMinifigs: 'looseMinifigs',
  minifigs: 'minifigs',
  resaleSets: 'resaleSets',
  sets: 'sets',
  tags: 'tags',
  timeline: 'timeline',
} as const

export const endPoints = {
  bricksetIgnoreList: '/bricksetIgnoreList.json',
  looseMinifigs: '/looseMinifigs.json',
  minifigs: '/minifigs.json',
  resaleSets: '/resaleSets.json',
  sets: '/sets.json',
  tags: '/tags.json',
  timeline: '/timeline.json',
} as const

export const getColumnLayoutEndPoint = ({
  userId,
  columnLayoutId,
}: ColumnLayoutTarget) =>
  `/userPreferences/${userId}/grids/${columnLayoutId}.json`
