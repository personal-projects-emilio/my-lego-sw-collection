import type { Minifig, MinifigsList } from 'types/minifigs'
import type { SetsList } from 'types/sets'

interface SetsAndMinifigs {
  setsList: SetsList
  minifigsList: MinifigsList
}

export const renameMinifigInSets = (
  setsList: SetsList,
  previousId: Minifig['id'],
  newId: Minifig['id']
): SetsList =>
  setsList.map((set) =>
    set.content?.minifigs?.some(({ id }) => id === previousId)
      ? {
          ...set,
          content: {
            ...set.content,
            minifigs: set.content.minifigs.map((minifig) =>
              minifig.id === previousId ? { ...minifig, id: newId } : minifig
            ),
          },
        }
      : set
  )

/** Derives the collection view from stored data. Stored totals and in-set values are ignored and recomputed. */
export const buildCollection = ({
  setsList,
  minifigsList,
}: SetsAndMinifigs): SetsAndMinifigs => {
  const cleanedMinifigsList = minifigsList.map((minifig) => ({
    ...minifig,
    owned: {
      total: minifig.owned.loose.quantity ?? 0,
      loose: minifig.owned.loose,
      inSet: [] as Minifig['owned']['inSet'],
    },
  }))

  const syncedList = setsList.reduce(
    ({ sets, minifigs }, currentSet) => {
      const updatedMinifigsList = [...minifigs]
      currentSet?.content?.minifigs?.forEach((setMinifig) => {
        const index = updatedMinifigsList.findIndex(
          ({ id }) => setMinifig.id === id
        )
        if (index === -1) return
        const currentMinifig = updatedMinifigsList[index]
        updatedMinifigsList[index] = {
          ...currentMinifig,
          possessed: currentSet.possessed ? true : currentMinifig.possessed,
          ...(!currentSet.tags?.includes('Seasonal') && {
            timelines: [
              ...new Set(
                (currentSet.timelines ?? []).concat(
                  currentMinifig.timelines ?? []
                )
              ),
            ].sort(),
            appearances: [
              ...new Set(
                (currentSet.appearances ?? []).concat(
                  currentMinifig.appearances ?? []
                )
              ),
            ].sort(),
          }),
          owned: {
            loose: currentMinifig.owned.loose,
            total: currentSet.possessed
              ? currentMinifig.owned.total + setMinifig.quantity
              : currentMinifig.owned.total,
            inSet: [
              ...currentMinifig.owned.inSet,
              {
                quantity: setMinifig.quantity,
                setId: currentSet.id,
                isInFrame: setMinifig.isInFrame ?? false,
              },
            ],
          },
        }
      })
      return {
        sets: [
          ...sets,
          {
            ...currentSet,
            timelines: Array.from(new Set(currentSet.timelines)),
            tags: Array.from(new Set(currentSet.tags)),
            appearances: Array.from(new Set(currentSet.appearances)),
            ...(currentSet.content && {
              content: {
                ...currentSet.content,
                minifigs:
                  currentSet.content.minifigs?.map((minifig) => ({
                    ...minifig,
                    characterName:
                      updatedMinifigsList.find(({ id }) => id === minifig.id)
                        ?.characterName ?? minifig.characterName,
                  })) ?? [],
              },
            }),
          },
        ],
        minifigs: updatedMinifigsList,
      }
    },
    { sets: [] as typeof setsList, minifigs: cleanedMinifigsList }
  )

  return { setsList: syncedList.sets, minifigsList: syncedList.minifigs }
}
