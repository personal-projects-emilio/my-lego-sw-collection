import type {
  CollectionMinifig,
  CollectionMinifigsList,
  LooseMinifig,
  LooseMinifigsList,
  Minifig,
  MinifigsList,
} from 'types/minifigs'
import type { Set, SetsList } from 'types/sets'

export const isSetRetired = (
  { exitDate, retired }: Pick<Set, 'exitDate' | 'retired'>,
  today = new Date().toISOString().slice(0, 10)
) => (exitDate ? exitDate < today : retired)

interface StoredCollection {
  setsList: SetsList
  minifigsList: MinifigsList
  looseMinifigsList: LooseMinifigsList
}

interface Collection {
  setsList: SetsList
  minifigsList: CollectionMinifigsList
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

const defaultLoose: LooseMinifig = {
  isInFrame: false,
  quantity: 0,
  unitBoughtPrice: 0,
  unitMarketValue: 0,
}

const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id)

export const updateLooseMinifig = (
  looseMinifigsList: LooseMinifigsList,
  minifigId: Minifig['id'],
  changes: Partial<LooseMinifig>
): LooseMinifigsList => {
  const previous = looseMinifigsList.find(({ id }) => id === minifigId)
  const others = looseMinifigsList.filter(({ id }) => id !== minifigId)
  const updated = { ...defaultLoose, ...previous, ...changes, id: minifigId }
  return updated.quantity > 0 ? [...others, updated].sort(byId) : others
}

export const renameLooseMinifig = (
  looseMinifigsList: LooseMinifigsList,
  previousId: Minifig['id'],
  newId: Minifig['id']
): LooseMinifigsList =>
  looseMinifigsList.some(({ id }) => id === previousId)
    ? looseMinifigsList
        .map((loose) =>
          loose.id === previousId ? { ...loose, id: newId } : loose
        )
        .sort(byId)
    : looseMinifigsList

/** Derives the collection view from stored data */
export const buildCollection = ({
  setsList,
  minifigsList,
  looseMinifigsList,
}: StoredCollection): Collection => {
  const looseById = new Map(looseMinifigsList.map((loose) => [loose.id, loose]))
  const cleanedMinifigsList = minifigsList.map((minifig): CollectionMinifig => {
    const stored = looseById.get(minifig.id)
    const loose: LooseMinifig = {
      isInFrame: stored?.isInFrame ?? defaultLoose.isInFrame,
      quantity: stored?.quantity ?? defaultLoose.quantity,
      unitBoughtPrice: stored?.unitBoughtPrice ?? defaultLoose.unitBoughtPrice,
      unitMarketValue: stored?.unitMarketValue ?? defaultLoose.unitMarketValue,
    }
    return {
      ...minifig,
      owned: { total: loose.quantity, loose, inSet: [] },
    }
  })

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
            total:
              currentMinifig.owned.total +
              setMinifig.quantity * currentSet.ownedQuantity,
            inSet: [
              ...currentMinifig.owned.inSet,
              {
                quantity: setMinifig.quantity,
                setId: currentSet.id,
                isInFrame: setMinifig.isInFrame ?? false,
                ownedQuantity: currentSet.ownedQuantity,
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
