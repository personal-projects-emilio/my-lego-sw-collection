import type {
  BooleanFilterField,
  FilterCategory,
  FilterField,
  FilterOption,
  FilterParam,
  FilterSearch,
  ItemsFilter,
  ItemsFilterConfig,
  ListFilterField,
} from 'types/itemsFilter'

type FilterFieldDefinition = {
  category: FilterCategory
  field: FilterField
  label: string
  param: FilterParam
}

export const filterCategories: { category: FilterCategory; title: string }[] = [
  { category: 'minifig', title: 'Minifig' },
  { category: 'set', title: 'Set' },
  { category: 'shared', title: 'Shared' },
]

export const filterFieldDefinitions: FilterFieldDefinition[] = [
  {
    field: 'characterName',
    label: 'Character',
    category: 'minifig',
    param: 'character',
  },
  {
    field: 'minifigId',
    label: 'Minifig ID',
    category: 'minifig',
    param: 'minifigId',
  },
  { field: 'retired', label: 'Retired', category: 'set', param: 'retired' },
  { field: 'setId', label: 'Set ID', category: 'set', param: 'setId' },
  { field: 'subtheme', label: 'Subtheme', category: 'set', param: 'subtheme' },
  { field: 'owned', label: 'Owned', category: 'shared', param: 'owned' },
  { field: 'tags', label: 'Tags', category: 'shared', param: 'tags' },
  {
    field: 'timeline',
    label: 'Timeline',
    category: 'shared',
    param: 'timeline',
  },
]

export const booleanFilterFields: BooleanFilterField[] = ['owned', 'retired']

export const filterParams: FilterParam[] = [
  'q',
  'off',
  ...filterFieldDefinitions.map(({ param }) => param),
]

export const emptyItemsFilter: ItemsFilter = {
  characterName: [],
  disabledFields: [],
  minifigId: [],
  owned: null,
  retired: null,
  search: '',
  setId: [],
  subtheme: [],
  tags: [],
  timeline: [],
}

const listSeparator = ','

const isBooleanField = (field: FilterField): field is BooleanFilterField =>
  booleanFilterFields.some((booleanField) => booleanField === field)

const isFilterField = (value: string): value is FilterField =>
  filterFieldDefinitions.some(({ field }) => field === value)

const formatListItem = (value: string) =>
  value.split('%').join('%25').split(listSeparator).join('%2C')

const parseListItem = (value: string) =>
  value.split('%2C').join(listSeparator).split('%25').join('%')

const splitList = (value: FilterSearch[FilterParam]) =>
  value === undefined || value === ''
    ? []
    : String(value).split(listSeparator).filter(Boolean).map(parseListItem)

const parseBoolean = (value: FilterSearch[FilterParam]) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : null

const toParamValue = (value: string) =>
  value.trim() !== '' && String(Number(value)) === value ? Number(value) : value

export const parseFilterSearch = (search: FilterSearch): ItemsFilter => ({
  ...emptyItemsFilter,
  ...Object.fromEntries(
    filterFieldDefinitions.map(({ field, param }) => [
      field,
      isBooleanField(field)
        ? parseBoolean(search[param])
        : splitList(search[param]),
    ])
  ),
  disabledFields: splitList(search.off).filter(isFilterField),
  search: search.q === undefined ? '' : String(search.q),
})

export const toFilterSearch = (filter: ItemsFilter): FilterSearch => ({
  ...Object.fromEntries(
    filterFieldDefinitions.map(({ field, param }) => {
      const value = filter[field]
      if (value === null) return [param, undefined]
      if (typeof value === 'boolean') return [param, value]
      return [
        param,
        value.length
          ? toParamValue(value.map(formatListItem).join(listSeparator))
          : undefined,
      ]
    })
  ),
  off: filter.disabledFields.length
    ? filter.disabledFields.join(listSeparator)
    : undefined,
  q: filter.search ? toParamValue(filter.search) : undefined,
})

export const hasFilterSearch = (search: FilterSearch) =>
  filterParams.some((param) => search[param] !== undefined)

export const pickFilterSearch = (search: FilterSearch): FilterSearch =>
  Object.fromEntries(
    filterParams.flatMap((param) =>
      search[param] === undefined ? [] : [[param, search[param]]]
    )
  )

export const isFieldActive = ({
  field,
  filter,
}: {
  field: FilterField
  filter: ItemsFilter
}) => {
  const value = filter[field]
  return Array.isArray(value) ? value.length > 0 : value !== null
}

export const getActiveFields = ({
  fields,
  filter,
}: {
  fields: FilterField[]
  filter: ItemsFilter
}) => fields.filter((field) => isFieldActive({ field, filter }))

export const getAppliedFilter = (filter: ItemsFilter): ItemsFilter => ({
  ...filter,
  ...Object.fromEntries(
    filter.disabledFields.map((field) => [field, emptyItemsFilter[field]])
  ),
  disabledFields: [],
})

export const removeInactiveDisabledFields = (
  filter: ItemsFilter
): ItemsFilter => ({
  ...filter,
  disabledFields: filter.disabledFields.filter((field) =>
    isFieldActive({ field, filter })
  ),
})

export const getConfigFields = <Item>(
  config: ItemsFilterConfig<Item>
): FilterField[] =>
  filterFieldDefinitions
    .map(({ field }) => field)
    .filter((field) =>
      isBooleanField(field)
        ? !!config.getBooleanValues[field]
        : !!config.getListValues[field]
    )

export const doesItemPass = <Item>({
  config,
  filter,
  item,
}: {
  config: ItemsFilterConfig<Item>
  filter: ItemsFilter
  item: Item
}) =>
  filterFieldDefinitions.every(({ field }) => {
    if (isBooleanField(field)) {
      const expected = filter[field]
      const getValue = config.getBooleanValues[field]
      return expected === null || !getValue || getValue(item) === expected
    }
    const expected = filter[field]
    const getValues = config.getListValues[field]
    if (!expected.length || !getValues) return true
    return getValues(item).some(({ value }) => expected.includes(value))
  })

export const getFilterOptions = <Item>({
  getValues,
  items,
}: {
  getValues: (item: Item) => FilterOption[]
  items: Item[]
}): FilterOption[] =>
  [
    ...new Map(
      items.flatMap(getValues).map((option) => [option.value, option])
    ).values(),
  ].sort((first, second) => first.label.localeCompare(second.label))

export const getFieldLabel = (field: FilterField) =>
  filterFieldDefinitions.find((definition) => definition.field === field)
    ?.label ?? field

export const isListFilterField = (
  field: FilterField
): field is ListFilterField => !isBooleanField(field)

export const toFilterOptions = (values: string[]): FilterOption[] =>
  values.map((value) => ({ label: value, value }))

export const toMinifigIdOption = ({
  characterName,
  id,
}: {
  characterName: string
  id: string
}): FilterOption => ({ label: `${id} · ${characterName}`, value: id })

export const toSetIdOption = ({
  id,
  name,
}: {
  id: number | string
  name: string
}): FilterOption => ({ label: `${id} · ${name}`, value: String(id) })

export const getOptionsByField = <Item>({
  config,
  items,
}: {
  config: ItemsFilterConfig<Item>
  items: Item[]
}) => {
  const mapFieldsToOptions: Partial<Record<ListFilterField, FilterOption[]>> =
    {}
  for (const field of getConfigFields(config)) {
    const getValues = isListFilterField(field)
      ? config.getListValues[field]
      : undefined
    if (isListFilterField(field) && getValues)
      mapFieldsToOptions[field] = getFilterOptions({ getValues, items })
  }
  return mapFieldsToOptions
}
