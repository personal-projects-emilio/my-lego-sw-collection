import type { BricksetIgnoreList } from 'types/brickset'
import type { IgnoreReason } from 'utils/brickset'

export const ignoreFields = [
  {
    key: 'ids',
    label: 'Ignored Set IDs',
    column: 'Number',
    buttonLabel: 'Ignore ID',
  },
  {
    key: 'themes',
    label: 'Ignored Themes',
    column: 'Theme',
    buttonLabel: 'Ignore Theme',
  },
  {
    key: 'subthemes',
    label: 'Ignored Subthemes',
    column: 'Subtheme',
    buttonLabel: 'Ignore Subtheme',
  },
] as const satisfies {
  key: keyof BricksetIgnoreList
  label: string
  column: string
  buttonLabel: string
}[]

export const ignoreReasonLabels: Record<IgnoreReason, string> = {
  id: 'Set ID',
  theme: 'Theme',
  subtheme: 'Subtheme',
}
