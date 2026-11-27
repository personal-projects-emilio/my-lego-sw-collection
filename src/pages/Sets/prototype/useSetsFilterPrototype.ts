import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import type { IRowNode } from 'ag-grid-community'
import { useTagsVocabulary, useTimeline } from 'hooks'
import type { CollectionSet } from 'types/sets'

import {
  doesSetPass,
  emptySetsFilter,
  type FilterOption,
  type FilterRequest,
  getActiveFields,
  isFieldActive,
  mapColumnIdsToFilterFields,
  type SetsFilter,
  type SetsFilterField,
} from './setsFilter'

const useSetsFilterPrototype = (setsList: CollectionSet[] = []) => {
  const tagsVocabulary = useTagsVocabulary()
  const timeline = useTimeline()
  const [filter, setFilter] = useState<SetsFilter>(emptySetsFilter)
  const [request, setRequest] = useState<FilterRequest>()
  const [disabledFields, setDisabledFields] = useState<SetsFilterField[]>([])
  const deferredFilter = useDeferredValue(filter)
  const appliedFilter = useMemo(
    () => ({
      ...deferredFilter,
      ...Object.fromEntries(
        disabledFields.map((field) => [field, emptySetsFilter[field]])
      ),
    }),
    [deferredFilter, disabledFields]
  )
  const activeFields = getActiveFields(appliedFilter)

  const mapFieldsToOptions = useMemo(() => {
    const minifigs = setsList.flatMap(({ content }) => content.minifigs)
    const getUniqueOptions = (options: FilterOption[]) =>
      [
        ...new Map(options.map((option) => [option.value, option])).values(),
      ].sort((first, second) => first.label.localeCompare(second.label))
    return {
      characterName: getUniqueOptions(
        minifigs.map(({ characterName }) => ({
          label: characterName,
          value: characterName,
        }))
      ),
      minifigId: getUniqueOptions(
        minifigs.map(({ id, characterName }) => ({
          label: `${id} · ${characterName}`,
          value: id,
        }))
      ),
      setId: getUniqueOptions(
        setsList.map(({ id, name }) => ({
          label: `${id} · ${name}`,
          value: String(id),
        }))
      ),
      subthemes: getUniqueOptions(
        setsList.map(({ subtheme }) => ({ label: subtheme, value: subtheme }))
      ),
    }
  }, [setsList])

  const matchedCount = useMemo(
    () =>
      setsList.filter((set) => doesSetPass({ filter: appliedFilter, set }))
        .length,
    [appliedFilter, setsList]
  )

  const isExternalFilterPresent = useCallback(
    () => getActiveFields(appliedFilter).length > 0,
    [appliedFilter]
  )

  const doesExternalFilterPass = useCallback(
    (node: IRowNode<CollectionSet>) =>
      !node.data || doesSetPass({ filter: appliedFilter, set: node.data }),
    [appliedFilter]
  )

  const activeKey = activeFields.join(',')
  const columnFilterActions = useMemo(
    () => ({
      isColumnFilterable: (columnId: string) =>
        columnId in mapColumnIdsToFilterFields,
      isColumnFiltered: (columnId: string) =>
        activeKey.split(',').includes(mapColumnIdsToFilterFields[columnId]),
      openColumnFilter: (columnId: string) => {
        const field = mapColumnIdsToFilterFields[columnId]
        if (field)
          setRequest({
            anchorElement: document.querySelector(
              `.ag-header-cell[col-id="${columnId}"]`
            ),
            field,
            requestedAt: Date.now(),
          })
      },
    }),
    [activeKey]
  )

  const onChange = (next: SetsFilter) => {
    setFilter(next)
    setDisabledFields((fields) =>
      fields.filter((field) => isFieldActive({ filter: next, field }))
    )
  }

  return {
    columnFilterActions,
    disabledFields,
    doesExternalFilterPass,
    filter,
    getTagLabel: tagsVocabulary.getPathLabel,
    getTimelineLabel: timeline.getPathLabel,
    isExternalFilterPresent,
    matchedCount,
    onChange,
    onToggleField: (field: SetsFilterField) =>
      setDisabledFields((fields) =>
        fields.includes(field)
          ? fields.filter((disabledField) => disabledField !== field)
          : [...fields, field]
      ),
    request,
    mapFieldsToOptions,
    totalCount: setsList.length,
  }
}

export default useSetsFilterPrototype
