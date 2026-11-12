import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import type { Set, SetsList } from 'types/sets'

export type IgnoreReason = 'number' | 'theme' | 'subtheme'

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

const ignoreReason = (
  { Number, Theme, Subtheme }: BricksetRow,
  ignoreList: BricksetIgnoreList
): IgnoreReason | null => {
  if (ignoreList.numbers.includes(Number)) return 'number'
  if (ignoreList.themes.includes(Theme)) return 'theme'
  if (ignoreList.subthemes.includes(Subtheme)) return 'subtheme'
  return null
}

const toNumber = (value: string | undefined, fallback: number) => {
  const number = Number(value)
  return value && !Number.isNaN(number) ? number : fallback
}

const trackedFields: [string, (set: Set) => FieldChange['from']][] = [
  ['imagePath', (set) => set.imagePath],
  ['EAN', (set) => set.EAN],
  ['UPC', (set) => set.UPC],
  ['releaseYear', (set) => set.releaseYear],
  ['prices.brickLinkSoldPriceNew', (set) => set.prices.brickLinkSoldPriceNew],
  ['prices.brickLinkSoldPriceUsed', (set) => set.prices.brickLinkSoldPriceUsed],
  ['dimensions.model.width', (set) => set.dimensions?.model?.width],
  ['dimensions.model.height', (set) => set.dimensions?.model?.height],
  ['dimensions.model.depth', (set) => set.dimensions?.model?.depth],
  ['dimensions.box.width', (set) => set.dimensions?.box?.width],
  ['dimensions.box.height', (set) => set.dimensions?.box?.height],
  ['dimensions.box.depth', (set) => set.dimensions?.box?.depth],
]

export const applyBricksetRow = (set: Set, row: BricksetRow): Set => ({
  ...set,
  imagePath: row.ImageFilename
    ? `https://images.brickset.com/sets/images/${row.ImageFilename}.jpg`
    : set.imagePath,
  EAN: row.EAN || set.EAN,
  UPC: row.UPC || set.UPC,
  releaseYear: toNumber(row.YearFrom, set.releaseYear),
  prices: {
    ...set.prices,
    brickLinkSoldPriceNew: toNumber(
      row.BrickLinkSoldPriceNew,
      set.prices.brickLinkSoldPriceNew ?? 0
    ),
    brickLinkSoldPriceUsed: toNumber(
      row.BrickLinkSoldPriceUsed,
      set.prices.brickLinkSoldPriceUsed ?? 0
    ),
  },
  dimensions: {
    model: {
      width: toNumber(row.ModelDimension1, set.dimensions?.model?.width ?? 0),
      height: toNumber(row.ModelDimension2, set.dimensions?.model?.height ?? 0),
      depth: toNumber(row.ModelDimension3, set.dimensions?.model?.depth ?? 0),
    },
    box: {
      width: toNumber(row.Width, set.dimensions?.box?.width ?? 0),
      height: toNumber(row.Height, set.dimensions?.box?.height ?? 0),
      depth: toNumber(row.Depth, set.dimensions?.box?.depth ?? 0),
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
    const reason = ignoreReason(row, ignoreList)
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
    const updatedSet = applyBricksetRow(set, matchedRows[0])
    const changes = trackedFields
      .map(([field, get]) => ({ field, from: get(set), to: get(updatedSet) }))
      .filter(({ from, to }) => from !== to)
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

const bricksetRowToSetId = (row: BricksetRow): Set['id'] => {
  if (row.Variant !== '1') return bricksetRowKey(row)
  return /^\d+$/.test(row.Number) ? Number(row.Number) : row.Number
}

export const newSetFromBricksetRow = (row: BricksetRow, base: Set): Set => {
  const quantity = toNumber(row.QtyOwned, 0)
  return applyBricksetRow(
    {
      ...base,
      id: bricksetRowToSetId(row),
      name: row.SetName,
      subtheme: row.Subtheme || row.Theme,
      possessed: quantity > 0,
      ownedQuantity: quantity,
      content: { ...base.content, partsQuantity: toNumber(row.Pieces, 0) },
    },
    row
  )
}
