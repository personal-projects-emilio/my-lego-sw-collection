import type { TagTarget } from './tags'

export type ListFilterField =
  | 'characterName'
  | 'location'
  | 'minifigId'
  | 'setId'
  | 'subtheme'
  | 'tags'
  | 'timeline'

export type BooleanFilterField = 'owned' | 'retired'

export type FilterField = ListFilterField | BooleanFilterField

export type FilterCategory = 'set' | 'minifig' | 'shared'

export type ItemsFilter = Record<ListFilterField, string[]> &
  Record<BooleanFilterField, boolean | null> & {
    disabledFields: FilterField[]
    search: string
  }

export type FilterParam =
  | 'character'
  | 'location'
  | 'minifigId'
  | 'off'
  | 'owned'
  | 'q'
  | 'retired'
  | 'setId'
  | 'subtheme'
  | 'tags'
  | 'timeline'

export type FilterSearch = Partial<
  Record<FilterParam, string | number | boolean | undefined>
>

export type FilterOption = { label: string; value: string }

export type ItemsFilterConfig<Item> = {
  getBooleanValues: Partial<Record<BooleanFilterField, (item: Item) => boolean>>
  getListValues: Partial<
    Record<ListFilterField, (item: Item) => FilterOption[]>
  >
  itemType?: TagTarget
  mapColumnIdsToFields: Record<string, FilterField>
}

export type ColumnFilterActions = {
  isColumnFilterable: (columnId: string) => boolean
  isColumnFiltered: (columnId: string) => boolean
  openColumnFilter: (params: {
    anchorElement: Element
    columnId: string
  }) => void
}

export type FilterRequest = {
  anchorElement: Element
  field: FilterField
  requestedAt: number
}
