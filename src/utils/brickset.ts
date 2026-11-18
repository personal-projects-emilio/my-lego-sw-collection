import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import type { Set, SetsList } from 'types/sets'

export type IgnoreReason = 'id' | 'theme' | 'subtheme'

export type FieldChange = {
  field: string
  from: string | number | null | undefined
  to: string | number | null | undefined
}

export type BricksetReport = {
  updates: { set: Set; changes: FieldChange[] }[]
  unchangedCount: number
  missing: BricksetRow[]
  ignored: { row: BricksetRow; reason: IgnoreReason }[]
  notInCsv: Set[]
  conflicts: Set[]
  setsList: SetsList
}

const rowIds = ({
  Number,
  USItemNumber = '',
  EUItemNumber = '',
  Variant,
}: BricksetRow) =>
  [
    Number,
    USItemNumber,
    EUItemNumber,
    `${Number}-${Variant}`,
    `${USItemNumber}-${Variant}`,
    `${EUItemNumber}-${Variant}`,
  ].filter((id) => id && !id.startsWith('-'))

const ignoreReason = ({
  row: { Number, Theme, Subtheme },
  ignoreList,
}: {
  row: BricksetRow
  ignoreList: BricksetIgnoreList
}): IgnoreReason | null => {
  if (ignoreList.ids.includes(Number)) return 'id'
  if (ignoreList.themes.includes(Theme)) return 'theme'
  if (ignoreList.subthemes.includes(Subtheme)) return 'subtheme'
  return null
}

const toNumber = ({
  value,
  fallback,
}: {
  value?: string
  fallback: number
}) => {
  const number = Number(value)
  return value && !Number.isNaN(number) ? number : fallback
}

const toPositiveNumber = ({
  value,
  existing,
}: {
  value?: string
  existing?: number | null
}) => Number(value) || existing || null

const toIsoDate = (value: string | undefined) => {
  const [, day, month, year] = value?.match(/^(\d{2})\/(\d{2})\/(\d{4})/) ?? []
  return year ? `${year}-${month}-${day}` : undefined
}

const trackedFields: [string, (set: Set) => FieldChange['from']][] = [
  ['bricksetImagePath', (set) => set.bricksetImagePath],
  ['EAN', (set) => set.EAN],
  ['UPC', (set) => set.UPC],
  ['releaseYear', (set) => set.releaseYear],
  ['exitDate', (set) => set.exitDate],
  ['content.partsQuantity', (set) => set.content?.partsQuantity],
  ['prices.brickLinkSoldPriceNew', (set) => set.prices.brickLinkSoldPriceNew],
  ['prices.brickLinkSoldPriceUsed', (set) => set.prices.brickLinkSoldPriceUsed],
  ['dimensions.model.width', (set) => set.dimensions?.model?.width],
  ['dimensions.model.height', (set) => set.dimensions?.model?.height],
  ['dimensions.model.depth', (set) => set.dimensions?.model?.depth],
  ['dimensions.box.width', (set) => set.dimensions?.box?.width],
  ['dimensions.box.height', (set) => set.dimensions?.box?.height],
  ['dimensions.box.depth', (set) => set.dimensions?.box?.depth],
]

export const applyBricksetRow = ({
  set,
  row,
}: {
  set: Set
  row: BricksetRow
}): Set => ({
  ...set,
  bricksetImagePath: row.ImageFilename
    ? `https://images.brickset.com/sets/images/${row.ImageFilename}.jpg`
    : set.bricksetImagePath,
  EAN: row.EAN || set.EAN,
  UPC: row.UPC || set.UPC,
  releaseYear: toNumber({ value: row.YearFrom, fallback: set.releaseYear }),
  exitDate: toIsoDate(row.ExitDate) ?? set.exitDate ?? null,
  content: {
    ...set.content,
    partsQuantity: toPositiveNumber({
      value: row.Pieces,
      existing: set.content?.partsQuantity,
    }),
  },
  prices: {
    ...set.prices,
    brickLinkSoldPriceNew: toNumber({
      value: row.BrickLinkSoldPriceNew,
      fallback: set.prices.brickLinkSoldPriceNew ?? 0,
    }),
    brickLinkSoldPriceUsed: toNumber({
      value: row.BrickLinkSoldPriceUsed,
      fallback: set.prices.brickLinkSoldPriceUsed ?? 0,
    }),
  },
  dimensions: {
    model: {
      width: toPositiveNumber({
        value: row.ModelDimension1,
        existing: set.dimensions?.model?.width,
      }),
      height: toPositiveNumber({
        value: row.ModelDimension2,
        existing: set.dimensions?.model?.height,
      }),
      depth: toPositiveNumber({
        value: row.ModelDimension3,
        existing: set.dimensions?.model?.depth,
      }),
    },
    box: {
      width: toPositiveNumber({
        value: row.Width,
        existing: set.dimensions?.box?.width,
      }),
      height: toPositiveNumber({
        value: row.Height,
        existing: set.dimensions?.box?.height,
      }),
      depth: toPositiveNumber({
        value: row.Depth,
        existing: set.dimensions?.box?.depth,
      }),
    },
  },
})

export const buildBricksetReport = ({
  rows,
  setsList,
  ignoreList,
}: {
  rows: BricksetRow[]
  setsList: SetsList
  ignoreList: BricksetIgnoreList
}): BricksetReport => {
  const setIds = new Map(setsList.map((set) => [String(set.id), set]))
  const rowsBySetId = new Map<string, BricksetRow[]>()
  const report: BricksetReport = {
    updates: [],
    unchangedCount: 0,
    missing: [],
    ignored: [],
    notInCsv: [],
    conflicts: [],
    setsList: [],
  }

  rows.forEach((row) => {
    const reason = ignoreReason({ row, ignoreList })
    if (reason) {
      report.ignored.push({ row, reason })
      return
    }
    const matchedId = rowIds(row).find((id) => setIds.has(id))
    if (!matchedId) {
      report.missing.push(row)
      return
    }
    rowsBySetId.set(matchedId, [...(rowsBySetId.get(matchedId) ?? []), row])
  })

  report.setsList = setsList.map((set) => {
    const matchedRows = rowsBySetId.get(String(set.id)) ?? []
    if (matchedRows.length === 0) {
      const isIgnored = report.ignored.some(({ row }) =>
        rowIds(row).includes(String(set.id))
      )
      if (!isIgnored) report.notInCsv.push(set)
      return set
    }
    if (matchedRows.length > 1) {
      report.conflicts.push(set)
      return set
    }
    const updatedSet = applyBricksetRow({ set, row: matchedRows[0] })
    const changes = trackedFields
      .map(([field, get]) => ({ field, from: get(set), to: get(updatedSet) }))
      .filter(({ from, to }) => (from ?? null) !== (to ?? null))
    if (changes.length === 0) {
      report.unchangedCount++
    } else {
      report.updates.push({ set: updatedSet, changes })
    }
    return updatedSet
  })

  return report
}

export const bricksetRowKey = ({ Number, Variant }: BricksetRow) =>
  `${Number}-${Variant}`

/** The id a new set gets: the bare number, with a `-variant` suffix only when the CSV or the collection has another variant of it. */
export const bricksetRowToSetId = ({
  row,
  rows,
  setsList,
}: {
  row: BricksetRow
  rows: BricksetRow[]
  setsList: SetsList
}): Set['id'] => {
  const hasOtherVariant =
    rows.some(
      ({ Number, Variant }) => Number === row.Number && Variant !== row.Variant
    ) || setsList.some(({ id }) => String(id).startsWith(`${row.Number}-`))
  if (row.Variant !== '1' || hasOtherVariant) return bricksetRowKey(row)
  return /^\d+$/.test(row.Number) ? Number(row.Number) : row.Number
}

export const newSetFromBricksetRow = ({
  row,
  base,
  id,
}: {
  row: BricksetRow
  base: Set
  id: Set['id']
}): Set => {
  const quantity = toNumber({ value: row.QtyOwned, fallback: 0 })
  return applyBricksetRow({
    set: {
      ...base,
      id,
      name: row.SetName,
      subtheme: row.Subtheme || row.Theme,
      ownedQuantity: quantity,
    },
    row,
  })
}

export const changeKey = ({ id, field }: { id: Set['id']; field: string }) =>
  `${id}|${field}`

const withValueAt = ({
  object,
  path: [key, ...path],
  value,
}: {
  object: Record<string, unknown>
  path: string[]
  value: unknown
}): Record<string, unknown> => ({
  ...object,
  [key]: path.length
    ? withValueAt({
        object: (object[key] ?? {}) as Record<string, unknown>,
        path,
        value,
      })
    : value,
})

/** The sets list to save, with the current value put back for every skipped change. */
export const skipChanges = ({
  report: { setsList, updates },
  skippedKeys,
}: {
  report: BricksetReport
  skippedKeys: string[]
}): SetsList =>
  setsList.map((set) => {
    const update = updates.find((update) => update.set === set)
    if (!update) return set
    return update.changes
      .filter(({ field }) =>
        skippedKeys.includes(changeKey({ id: set.id, field }))
      )
      .reduce(
        (result, { field, from }) =>
          withValueAt({
            object: result,
            path: field.split('.'),
            value: from,
          }) as Set,
        set
      )
  })
