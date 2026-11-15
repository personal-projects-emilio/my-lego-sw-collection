import { useMemo } from 'react'

import { useLooseMinifigsQuery } from 'api/looseMinifigs'
import { useMinifigsQuery } from 'api/minifigs'
import { useSetsQuery } from 'api/sets'
import { useTagsQuery } from 'api/tags'
import { buildCollection } from 'utils/lego'

type CollectionInputs = Parameters<typeof buildCollection>[0]

let lastCollection:
  | { inputs: CollectionInputs; collection: ReturnType<typeof buildCollection> }
  | undefined

const buildSharedCollection = (inputs: CollectionInputs) => {
  if (
    lastCollection?.inputs.setsList !== inputs.setsList ||
    lastCollection.inputs.minifigsList !== inputs.minifigsList ||
    lastCollection.inputs.looseMinifigsList !== inputs.looseMinifigsList ||
    lastCollection.inputs.tagsList !== inputs.tagsList
  ) {
    lastCollection = { inputs, collection: buildCollection(inputs) }
  }
  return lastCollection.collection
}

/** Sets and minifigs with their calculated values, recomputed whenever either query data changes */
const useCollection = () => {
  const { data: setsList, isLoading: isSetsLoading } = useSetsQuery()
  const { data: minifigsList, isLoading: isMinifigsLoading } =
    useMinifigsQuery()
  const { data: looseMinifigsList, isLoading: isLooseMinifigsLoading } =
    useLooseMinifigsQuery()
  const { data: tagsList, isLoading: isTagsLoading } = useTagsQuery()

  const collection = useMemo(
    () =>
      setsList && minifigsList && looseMinifigsList && tagsList
        ? buildSharedCollection({
            setsList,
            minifigsList,
            looseMinifigsList,
            tagsList,
          })
        : undefined,
    [setsList, minifigsList, looseMinifigsList, tagsList]
  )

  return {
    ...collection,
    isLoading:
      isSetsLoading ||
      isMinifigsLoading ||
      isLooseMinifigsLoading ||
      isTagsLoading,
  }
}

export default useCollection
