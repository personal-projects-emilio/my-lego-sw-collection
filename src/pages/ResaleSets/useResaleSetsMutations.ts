import { useCallback } from 'react'

import { useResaleSetsMutation, useResaleSetsQuery } from 'api/resaleSets'
import type { ResaleSet, ResaleSetsList } from 'types/resale'
import type { Set } from 'types/sets'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

const byId = (a: ResaleSet, b: ResaleSet) =>
  String(a.id).localeCompare(String(b.id), undefined, { numeric: true })

const useResaleSetsMutations = () => {
  const { data: resaleSetsList } = useResaleSetsQuery()
  const { mutateAsync, isPending } = useResaleSetsMutation()

  const save = useCallback(
    (getList: (list: ResaleSetsList) => ResaleSetsList) => {
      assert(isNotNullOrUndefined(resaleSetsList))
      return mutateAsync(getList(resaleSetsList).sort(byId)).then(() => {})
    },
    [mutateAsync, resaleSetsList]
  )

  const addResaleSet = useCallback(
    (resaleSet: ResaleSet) => save((list) => [...list, resaleSet]),
    [save]
  )

  const editResaleSet = useCallback(
    (resaleSet: ResaleSet) =>
      save((list) =>
        list.map((item) => (item.id === resaleSet.id ? resaleSet : item))
      ),
    [save]
  )

  const deleteResaleSet = useCallback(
    (setId: Set['id']) => save((list) => list.filter(({ id }) => id !== setId)),
    [save]
  )

  return {
    addResaleSet,
    deleteResaleSet,
    editResaleSet,
    isPending,
    resaleSetsList,
  }
}

export default useResaleSetsMutations
