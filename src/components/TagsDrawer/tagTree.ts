import type { SortingStrategy } from '@dnd-kit/sortable'
import { PartlySavedError } from 'hooks/useVocabularyMutations'
import type { Tag, TagId } from 'types/tags'
import type { TagEdit } from 'utils/tags'

export const indent = 24

export const keepInPlace: SortingStrategy = () => null

export const saveError = (fallback: string) => (error: unknown) =>
  error instanceof PartlySavedError ? error.message : fallback

export type Target = 'sets' | 'minifigs'

export const targets: Target[] = ['sets', 'minifigs']

type TargetCheck = { appliesTo: Tag['appliesTo']; target: Target }

export const doesApplyToTarget = ({ appliesTo, target }: TargetCheck) =>
  appliesTo === 'both' || appliesTo === target

export const toggleAppliesTo = ({
  appliesTo,
  target,
}: TargetCheck): Tag['appliesTo'] => {
  const other: Target = target === 'sets' ? 'minifigs' : 'sets'
  if (!doesApplyToTarget({ appliesTo, target })) return 'both'
  return doesApplyToTarget({ appliesTo, target: other }) ? other : appliesTo
}

export type Editing = { id: TagId } | { parent?: TagId }

export type Drag = { activeId: TagId; overId?: TagId; depthDelta: number }

export type Run = (edit: TagEdit | undefined, description: string) => void

export type RowActions = {
  add: (id: TagId) => void
  menu: (id: TagId, anchor: HTMLElement) => void
  startRenaming: (id: TagId) => void
  rename: (id: TagId, label: string) => void
  stopEditing: () => void
  toggle: (id: TagId) => void
}
