import type { Minifig, MinifigsList } from './minifigs'
import type { Set, SetsList } from './sets'

export type Item = 'minifig' | 'set'
export type ItemId = Minifig['id'] | Set['id']

export type VocabularyState<ListKey extends string, Entry> = Record<
  ListKey,
  Entry[]
> & {
  setsList: SetsList
  minifigsList: MinifigsList
}
