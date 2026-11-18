import type {
  CollectionMinifig,
  CollectionMinifigsList,
  LooseMinifig,
  LooseMinifigsList,
  Minifig,
  MinifigsList,
} from 'types/minifigs'
import type { CollectionSetsList, Set, SetsList } from 'types/sets'
import type { TagsList, TagTarget } from 'types/tags'
import type { TimelineList } from 'types/timeline'

import { buildTagsVocabulary, seasonalTagId } from './tags'
import { buildTimeline } from './timeline'

export const isSetRetired = ({
  exitDate,
  retired,
  today = new Date().toISOString().slice(0, 10),
}: Pick<Set, 'exitDate' | 'retired'> & { today?: string }) =>
  exitDate ? exitDate < today : retired

type ResaleInputs = {
  officialPrice: number | null
  quantityBought: number
  unitBoughtPrice: number
  unitSellingPrice: number | null
  quantitySold: number
}

export const getResaleValues = ({
  officialPrice,
  quantityBought,
  unitBoughtPrice,
  unitSellingPrice,
  quantitySold,
}: ResaleInputs) => {
  const unitProfit =
    unitSellingPrice === null ? null : unitSellingPrice - unitBoughtPrice
  return {
    discount: officialPrice
      ? (officialPrice - unitBoughtPrice) / officialPrice
      : null,
    totalBought: quantityBought * unitBoughtPrice,
    unitProfit,
    profitPercentage:
      unitProfit !== null && unitBoughtPrice > 0
        ? unitProfit / unitBoughtPrice
        : null,
    totalSold:
      unitSellingPrice === null ? null : quantitySold * unitSellingPrice,
    totalProfit: unitProfit === null ? null : quantitySold * unitProfit,
  }
}

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0)

export const getResaleTotals = (resaleSets: ResaleInputs[]) => {
  const rows = resaleSets.map((resaleSet) => ({
    ...resaleSet,
    ...getResaleValues(resaleSet),
  }))
  const averagePerUnitBought = (
    pick: (row: (typeof rows)[number]) => number | null
  ) => {
    const weighted = rows.flatMap((row) => {
      const value = pick(row)
      return value === null ? [] : [{ value, quantity: row.quantityBought }]
    })
    const quantity = sum(weighted.map((w) => w.quantity))
    return quantity > 0
      ? sum(weighted.map((w) => w.value * w.quantity)) / quantity
      : null
  }
  const officialPrice = averagePerUnitBought((row) => row.officialPrice)
  const unitBoughtPrice = averagePerUnitBought((row) => row.unitBoughtPrice)
  const unitProfit = averagePerUnitBought((row) => row.unitProfit)

  return {
    officialPrice,
    quantityBought: sum(rows.map((row) => row.quantityBought)),
    unitBoughtPrice,
    discount:
      officialPrice !== null && officialPrice > 0 && unitBoughtPrice !== null
        ? 1 - unitBoughtPrice / officialPrice
        : null,
    totalBought: sum(rows.map((row) => row.totalBought)),
    unitSellingPrice: averagePerUnitBought((row) => row.unitSellingPrice),
    quantitySold: sum(rows.map((row) => row.quantitySold)),
    unitProfit,
    profitPercentage:
      unitProfit !== null && unitBoughtPrice !== null && unitBoughtPrice > 0
        ? unitProfit / unitBoughtPrice
        : null,
    totalSold: sum(rows.map((row) => row.totalSold ?? 0)),
    totalProfit: sum(rows.map((row) => row.totalProfit ?? 0)),
  }
}

interface StoredCollection {
  setsList: SetsList
  minifigsList: MinifigsList
  looseMinifigsList: LooseMinifigsList
  tagsList: TagsList
  timelineList: TimelineList
}

interface Collection {
  setsList: CollectionSetsList
  minifigsList: CollectionMinifigsList
}

type Rename = { previousId: Minifig['id']; newId: Minifig['id'] }

export const renameMinifigInSets = ({
  setsList,
  previousId,
  newId,
}: Rename & { setsList: SetsList }): SetsList =>
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

export const updateLooseMinifig = ({
  looseMinifigsList,
  minifigId,
  changes,
}: {
  looseMinifigsList: LooseMinifigsList
  minifigId: Minifig['id']
  changes: Partial<LooseMinifig>
}): LooseMinifigsList => {
  const previous = looseMinifigsList.find(({ id }) => id === minifigId)
  const others = looseMinifigsList.filter(({ id }) => id !== minifigId)
  const updated = { ...defaultLoose, ...previous, ...changes, id: minifigId }
  return updated.quantity > 0 ? [...others, updated].sort(byId) : others
}

export const renameLooseMinifig = ({
  looseMinifigsList,
  previousId,
  newId,
}: Rename & { looseMinifigsList: LooseMinifigsList }): LooseMinifigsList =>
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
  tagsList,
  timelineList,
}: StoredCollection): Collection => {
  const tagsVocabulary = buildTagsVocabulary(tagsList)
  const timeline = buildTimeline(timelineList)
  const withSource = ({
    record,
    ids,
    source,
  }: {
    record: Record<string, Array<string | number>>
    ids: string[]
    source: string | number
  }) =>
    ids.reduce(
      (result, id) =>
        result[id]?.includes(source)
          ? result
          : { ...result, [id]: [...(result[id] ?? []), source] },
      record
    )
  const ownTags = ({ tags, target }: { tags?: string[]; target: TagTarget }) =>
    tagsVocabulary.withImplied(
      (tags ?? []).filter((id) => tagsVocabulary.appliesTo({ id, target }))
    )
  const isSeasonal = (set: Set) => !!set.tags?.includes(seasonalTagId)
  const inheritable = (set: Set) =>
    isSeasonal(set)
      ? []
      : ownTags({ tags: set.tags, target: 'sets' }).filter(
          (id) =>
            tagsVocabulary.rootOf(id)?.inherited &&
            tagsVocabulary.appliesTo({ id, target: 'minifigs' })
        )
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
      effectiveTags: [],
      inheritedTags: {},
      effectiveTimeline: [],
      inheritedTimeline: {},
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
          inheritedTags: withSource({
            record: currentMinifig.inheritedTags,
            ids: inheritable(currentSet),
            source: currentSet.id,
          }),
          inheritedTimeline: withSource({
            record: currentMinifig.inheritedTimeline,
            ids: isSeasonal(currentSet)
              ? []
              : timeline.withImplied(currentSet.timeline ?? []),
            source: currentSet.id,
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
                setOwnedQuantity: currentSet.ownedQuantity,
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
            tags: Array.from(new Set(currentSet.tags)),
            effectiveTags: ownTags({ tags: currentSet.tags, target: 'sets' }),
            effectiveTimeline: timeline.withImplied(currentSet.timeline ?? []),
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
    { sets: [] as CollectionSetsList, minifigs: cleanedMinifigsList }
  )

  return {
    setsList: syncedList.sets,
    minifigsList: syncedList.minifigs.map((minifig) => ({
      ...minifig,
      effectiveTags: tagsVocabulary.sort([
        ...ownTags({ tags: minifig.tags, target: 'minifigs' }),
        ...Object.keys(minifig.inheritedTags),
      ]),
      effectiveTimeline: timeline.sort([
        ...timeline.withImplied(minifig.timeline ?? []),
        ...Object.keys(minifig.inheritedTimeline),
      ]),
    })),
  }
}
