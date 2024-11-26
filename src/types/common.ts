import type { Minifig } from './minifigs'
import type { Set } from './sets'

export type Item = 'minifig' | 'set'
export type ItemId = Minifig['id'] | Set['id']
