import { useCallback, useMemo, useState } from 'react'

import type { IRowNode } from 'ag-grid-community'
import { useTagsVocabulary, useTimeline } from 'hooks'
import type { CollectionSet } from 'types/sets'

import {
  doesSetPass,
  emptySetsFilter,
  type FilterRequest,
  getActiveFields,
  mapColumnIdsToFilterFields,
  type SetsFilter,
} from './setsFilter'

const useSetsFilterPrototype = (setsList: CollectionSet[] = []) => {
  const tagsVocabulary = useTagsVocabulary()
  const timeline = useTimeline()
  const [filter, setFilter] = useState<SetsFilter>(emptySetsFilter)
  const [request, setRequest] = useState<FilterRequest>()
  const activeFields = getActiveFields(filter)

  const subthemeOptions = useMemo(
    () => [...new Set(setsList.map(({ subtheme }) => subtheme))].sort(),
    [setsList]
  )

  const matchedCount = useMemo(
    () => setsList.filter((set) => doesSetPass({ filter, set })).length,
    [filter, setsList]
  )

  const isExternalFilterPresent = useCallback(
    () => getActiveFields(filter).length > 0,
    [filter]
  )

  const doesExternalFilterPass = useCallback(
    (node: IRowNode<CollectionSet>) =>
      !node.data || doesSetPass({ filter, set: node.data }),
    [filter]
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
        if (field) setRequest({ field, requestedAt: Date.now() })
      },
    }),
    [activeKey]
  )

  return {
    columnFilterActions,
    doesExternalFilterPass,
    filter,
    getTagLabel: tagsVocabulary.getPathLabel,
    getTimelineLabel: timeline.getPathLabel,
    isExternalFilterPresent,
    matchedCount,
    onChange: setFilter,
    request,
    subthemeOptions,
    totalCount: setsList.length,
  }
}

export default useSetsFilterPrototype
