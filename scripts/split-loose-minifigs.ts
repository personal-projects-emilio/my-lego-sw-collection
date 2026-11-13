/**
 * One-off LSW-33 migration: moves `owned` out of the stored minifigs into the looseMinifigs table.
 *
 * Usage: pnpm tsx scripts/split-loose-minifigs.ts <minifigs export.json> <output dir>
 * Writes <output dir>/looseMinifigs.json and <output dir>/minifigs.json (same minifigs, without `owned`).
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type StoredMinifig = {
  id: string
  owned?: { loose?: { isInFrame?: boolean; quantity?: number } }
  [key: string]: unknown
}

const [inputPath, outputDir] = process.argv.slice(2)
if (!inputPath || !outputDir) {
  console.error(
    'Usage: pnpm tsx scripts/split-loose-minifigs.ts <minifigs export.json> <output dir>'
  )
  process.exit(1)
}

const minifigs: StoredMinifig[] = JSON.parse(readFileSync(inputPath, 'utf8'))

// Same shape as minifigs and sets: a list of items carrying their id, sorted by id
const looseMinifigsList = minifigs
  .filter(({ owned }) => (owned?.loose?.quantity ?? 0) > 0)
  .map(({ id, owned }) => ({
    id,
    isInFrame: owned?.loose?.isInFrame ?? false,
    quantity: owned?.loose?.quantity ?? 0,
    unitBoughtPrice: 0,
    unitMarketValue: 0,
  }))
  .sort((a, b) => a.id.localeCompare(b.id))
const strippedMinifigs = minifigs.map((minifig) => {
  const stripped = { ...minifig }
  delete stripped.owned
  return stripped
})

const totalLoose = (list: StoredMinifig[]) =>
  list.reduce((sum, { owned }) => sum + (owned?.loose?.quantity ?? 0), 0)
const movedLoose = looseMinifigsList.reduce(
  (sum, { quantity }) => sum + quantity,
  0
)
// No loose minifig may be lost in the move
if (movedLoose !== totalLoose(minifigs)) {
  throw new Error(`Moved ${movedLoose} loose, expected ${totalLoose(minifigs)}`)
}

writeFileSync(
  join(outputDir, 'looseMinifigs.json'),
  JSON.stringify(looseMinifigsList, null, 2)
)
writeFileSync(
  join(outputDir, 'minifigs.json'),
  JSON.stringify(strippedMinifigs, null, 2)
)
console.log(
  `${minifigs.length} minifigs, ${looseMinifigsList.length} with loose (${movedLoose} in total), written to ${outputDir}`
)
