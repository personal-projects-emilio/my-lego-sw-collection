import type { Set } from 'types/sets'

export type SetFormModalProps =
  | {
      isEdit: true
      setData: Set
    }
  | {
      isEdit: false
      setData?: Pick<Set, 'subtheme' | 'tags'>
    }
