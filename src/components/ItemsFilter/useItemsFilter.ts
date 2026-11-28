import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import type { IRowNode } from 'ag-grid-community'
import type {
  ColumnFilterActions,
  FilterOption,
  FilterRequest,
  FilterSearch,
  ItemsFilter,
  ItemsFilterConfig,
} from 'types/itemsFilter'
import {
  doesItemPass,
  emptyItemsFilter,
  filterFieldDefinitions,
  getActiveFields,
  getAppliedFilter,
  getConfigFields,
  getFilterOptions,
  getOptionsByField,
  isListFilterField,
  parseFilterSearch,
  pickFilterSearch,
  removeInactiveDisabledFields,
  toFilterSearch,
} from 'utils/itemsFilter'

import useCollectionFilterOptions from './useCollectionFilterOptions'
import useSavedFilterSync from './useSavedFilterSync'

const useItemsFilter = <Item>({
  config,
  items = [],
}: {
  config: ItemsFilterConfig<Item>
  items?: Item[]
}) => {
  const search: FilterSearch = useSearch({ strict: false })
  const navigate = useNavigate()
  const filterSearchKey = JSON.stringify(pickFilterSearch(search))
  const filterSearch = useMemo(
    (): FilterSearch => JSON.parse(filterSearchKey),
    [filterSearchKey]
  )
  const filter = useMemo(() => parseFilterSearch(filterSearch), [filterSearch])
  const [request, setRequest] = useState<FilterRequest>()

  const setFilterSearch = useCallback(
    (next: FilterSearch) =>
      void navigate({
        to: '.',
        search: (previous: FilterSearch) => ({ ...previous, ...next }),
        replace: true,
      }),
    [navigate]
  )
  const onChange = useCallback(
    (next: ItemsFilter) =>
      setFilterSearch(toFilterSearch(removeInactiveDisabledFields(next))),
    [setFilterSearch]
  )

  useSavedFilterSync({ filterSearch, setFilterSearch })

  const fields = useMemo(() => getConfigFields(config), [config])
  const deferredFilter = useDeferredValue(filter)
  const appliedFilter = useMemo(
    () => getAppliedFilter(deferredFilter),
    [deferredFilter]
  )
  const appliedFields = getActiveFields({ fields, filter: appliedFilter })
  const appliedFieldsKey = appliedFields.join()

  const collectionOptions = useCollectionFilterOptions()
  const mapFieldsToOptions = useMemo(() => {
    const pageOptions = getOptionsByField({ config, items })
    return Object.fromEntries(
      filterFieldDefinitions.flatMap(({ field }) =>
        isListFilterField(field)
          ? [
              [
                field,
                getFilterOptions({
                  getValues: (options: FilterOption[]) => options,
                  items: [
                    collectionOptions[field] ?? [],
                    pageOptions[field] ?? [],
                  ],
                }),
              ],
            ]
          : []
      )
    )
  }, [collectionOptions, config, items])

  const isExternalFilterPresent = useCallback(
    () => appliedFieldsKey !== '',
    [appliedFieldsKey]
  )
  const doesExternalFilterPass = useCallback(
    ({ data }: IRowNode<Item>) =>
      !data || doesItemPass({ config, filter: appliedFilter, item: data }),
    [appliedFilter, config]
  )

  const columnFilter = useMemo(
    (): ColumnFilterActions => ({
      isColumnFilterable: (columnId) => columnId in config.mapColumnIdsToFields,
      isColumnFiltered: (columnId) =>
        appliedFieldsKey
          .split(',')
          .includes(config.mapColumnIdsToFields[columnId]),
      openColumnFilter: ({ anchorElement, columnId }) => {
        const field = config.mapColumnIdsToFields[columnId]
        if (field) setRequest({ anchorElement, field, requestedAt: Date.now() })
      },
    }),
    [appliedFieldsKey, config]
  )

  return {
    barProps: {
      fields,
      filter,
      mapFieldsToOptions,
      onChange,
      request,
    },
    gridProps: {
      columnFilter,
      doesExternalFilterPass,
      isExternalFilterPresent,
      onReset: () => onChange(emptyItemsFilter),
      quickFilterText: appliedFilter.search,
    },
  }
}

export default useItemsFilter
