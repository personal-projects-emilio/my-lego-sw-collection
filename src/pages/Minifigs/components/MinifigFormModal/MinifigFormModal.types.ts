import type { Minifig } from 'types/minifigs'

export type MinifigFormModalProps =
  | {
      isEdit: true
      minifigData: Minifig
    }
  | {
      isEdit: false
      minifigData?: Pick<
        Minifig,
        'appearances' | 'characterName' | 'tags' | 'timelines'
      >
    }
