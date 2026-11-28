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
  { category: 'shared', title: 'Shared' },
  { category: 'set', title: 'Set' },
  { category: 'minifig', title: 'Minifig' },
]

export const filterFieldDefinitions: FilterFieldDefinition[] = [
  { field: 'owned', label: 'Owned', category: 'shared', param: 'owned' },
  { field: 'retired', label: 'Retired', category: 'shared', param: 'retired' },
  { field: 'tags', label: 'Tags', category: 'shared', param: 'tags' },
  {
    field: 'timeline',
    label: 'Timeline',
    category: 'shared',
    param: 'timeline',
  },
  { field: 'setId', label: 'ID', category: 'set', param: 'setId' },
  { field: 'subtheme', label: 'Subtheme', category: 'set', param: 'subtheme' },
  { field: 'location', label: 'Location', category: 'set', param: 'location' },
  {
    field: 'characterName',
    label: 'Character',
    category: 'minifig',
    param: 'character',
  },
  { field: 'minifigId', label: 'ID', category: 'minifig', param: 'minifigId' },
]

export const booleanFilterFields: BooleanFilterField[] = ['owned', 'retired']

export const filterParams: FilterParam[] = [
  'q',
  'off',
  ...filterFieldDefinitions.map(({ param }) => param),
]

const sharedFields: FilterField[] = ['minifigId', 'setId', 'tags', 'timeline']

const sharedParams: FilterParam[] = [
  'q',
  'off',
  ...filterFieldDefinitions
    .filter(({ field }) => sharedFields.includes(field))
    .map(({ param }) => param),
]

export const emptyItemsFilter: ItemsFilter = {
  characterName: [],
  disabledFields: [],
  location: [],
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

const splitList = (value: FilterSearch[FilterParam]) =>
  value === undefined || value === ''
    ? []
    : String(value).split(listSeparator).filter(Boolean)

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
        value.length ? toParamValue(value.join(listSeparator)) : undefined,
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

export const keepSharedFilterSearch = (search: FilterSearch): FilterSearch => {
  const disabledFields = splitList(search.off).filter((field) =>
    sharedFields.some((sharedField) => sharedField === field)
  )
  return {
    ...Object.fromEntries(
      filterParams.map((param) => [
        param,
        sharedParams.includes(param) ? search[param] : undefined,
      ])
    ),
    off: disabledFields.length ? disabledFields.join(listSeparator) : undefined,
  }
}

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

export const getFieldLabel = (field: FilterField) => {
  const definition = filterFieldDefinitions.find(
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

export const isListFilterField = (
  field: FilterField
): field is ListFilterField => !isBooleanField(field)

export const toFilterOptions = (values: string[]): FilterOption[] =>
  values.map((value) => ({ label: value, value }))

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
