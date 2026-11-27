import type { CollectionSet } from 'types/sets'
import type { TagId } from 'types/tags'
import type { TimelineId } from 'types/timeline'
import { isSetRetired } from 'utils/lego'

export type SetsFilter = {
  search: string
  setId: string[]
  minifigId: string[]
  characterName: string[]
  owned: boolean | null
  retired: boolean | null
  subthemes: string[]
  tags: TagId[]
  timeline: TimelineId[]
}

export type SetsFilterField = keyof SetsFilter

export type ListFilterField =
  'characterName' | 'minifigId' | 'setId' | 'subthemes'

export const listFilterFields: ListFilterField[] = [
  'characterName',
  'minifigId',
  'setId',
  'subthemes',
]

export type FilterOption = { label: string; value: string }

export type FilterRequest = {
  anchorElement?: Element | null
  field: SetsFilterField
  requestedAt: number
}

export const emptySetsFilter: SetsFilter = {
  search: '',
  setId: [],
  minifigId: [],
  characterName: [],
  owned: null,
  retired: null,
  subthemes: [],
  tags: [],
  timeline: [],
}

export type FilterCategory = 'shared' | 'set' | 'minifig'

export const filterCategories: { category: FilterCategory; title: string }[] = [
  { category: 'shared', title: 'Shared' },
  { category: 'set', title: 'Set' },
  { category: 'minifig', title: 'Minifig' },
]

export const setsFilterFields: {
  field: SetsFilterField
  label: string
  category: FilterCategory
}[] = [
  { field: 'search', label: 'Search', category: 'shared' },
  { field: 'owned', label: 'Owned', category: 'shared' },
  { field: 'retired', label: 'Retired', category: 'shared' },
  { field: 'tags', label: 'Tags', category: 'shared' },
  { field: 'timeline', label: 'Timeline', category: 'shared' },
  { field: 'setId', label: 'ID', category: 'set' },
  { field: 'subthemes', label: 'Subtheme', category: 'set' },
  { field: 'characterName', label: 'Character', category: 'minifig' },
  { field: 'minifigId', label: 'ID', category: 'minifig' },
]

export const mapColumnIdsToFilterFields: Record<string, SetsFilterField> = {
  id: 'setId',
  name: 'search',
  subtheme: 'subthemes',
  retired: 'retired',
  ownedQuantity: 'owned',
  tags: 'tags',
  timeline: 'timeline',
  'content.minifigs': 'minifigId',
}

export const getFieldLabel = (field: SetsFilterField) => {
  const definition = setsFilterFields.find(
    (candidate) => candidate.field === field
  )
  if (!definition) return field
  const categoryTitle = filterCategories.find(
    ({ category }) => category === definition.category
  )?.title
  return definition.category === 'shared'
    ? definition.label
    : `${categoryTitle} ${definition.label}`
}

export const isFieldActive = ({
  filter,
  field,
}: {
  filter: SetsFilter
  field: SetsFilterField
}) => {
  const value = filter[field]
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim() !== ''
  return value !== null
}

export const getActiveFields = (filter: SetsFilter) =>
  setsFilterFields
    .map(({ field }) => field)
    .filter((field) => isFieldActive({ filter, field }))

const hasText = ({ value, text }: { value: unknown; text: string }) =>
  String(value).toLowerCase().includes(text.trim().toLowerCase())

export const doesSetPass = ({
  filter,
  set,
}: {
  filter: SetsFilter
  set: CollectionSet
}) => {
  const minifigs = set.content.minifigs
  return (
    (!filter.search ||
      hasText({ value: set.name, text: filter.search }) ||
      hasText({ value: set.id, text: filter.search })) &&
    (!filter.setId.length || filter.setId.includes(String(set.id))) &&
    (!filter.minifigId.length ||
      minifigs.some(({ id }) => filter.minifigId.includes(id))) &&
    (!filter.characterName.length ||
      minifigs.some(({ characterName }) =>
        filter.characterName.includes(characterName)
      )) &&
    (filter.owned === null || set.ownedQuantity > 0 === filter.owned) &&
    (filter.retired === null || isSetRetired(set) === filter.retired) &&
    (!filter.subthemes.length || filter.subthemes.includes(set.subtheme)) &&
    (!filter.tags.length ||
      filter.tags.some((id) => set.effectiveTags.includes(id))) &&
    (!filter.timeline.length ||
      filter.timeline.some((id) => set.effectiveTimeline.includes(id)))
  )
}

export const formatFieldValue = ({
  filter,
  field,
  getTagLabel,
  getTimelineLabel,
}: {
  filter: SetsFilter
  field: SetsFilterField
  getTagLabel: (id: TagId) => string
  getTimelineLabel: (id: TimelineId) => string
}) => {
  if (field === 'owned' || field === 'retired')
    return filter[field] ? 'Yes' : 'No'
  if (field === 'tags') return filter.tags.map(getTagLabel).join(', ')
  if (field === 'timeline')
    return filter.timeline.map(getTimelineLabel).join(', ')
  const value = filter[field]
  return Array.isArray(value) ? value.join(', ') : value
}

export type FilterVariantProps = {
  disabledFields: SetsFilterField[]
  filter: SetsFilter
  getTagLabel: (id: TagId) => string
  getTimelineLabel: (id: TimelineId) => string
  onChange: (filter: SetsFilter) => void
  onToggleField: (field: SetsFilterField) => void
  request?: FilterRequest
  mapFieldsToOptions: Record<ListFilterField, FilterOption[]>
}
