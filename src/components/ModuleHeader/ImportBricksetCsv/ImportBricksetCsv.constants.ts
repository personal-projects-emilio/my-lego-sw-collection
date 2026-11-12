import type { BricksetIgnoreList } from 'types/brickset'

export const ignoreFields = [
  {
    key: 'ids',
    label: 'Ignored set IDs',
    column: 'Number',
    buttonLabel: 'Ignore id',
  },
  {
    key: 'themes',
    label: 'Ignored themes',
    column: 'Theme',
    buttonLabel: 'Ignore theme',
  },
  {
    key: 'subthemes',
    label: 'Ignored subthemes',
    column: 'Subtheme',
    buttonLabel: 'Ignore subtheme',
  },
] as const satisfies {
  key: keyof BricksetIgnoreList
  label: string
  column: string
  buttonLabel: string
}[]
