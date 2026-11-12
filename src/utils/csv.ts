import type { BricksetRow } from 'types/brickset'

/** Parses CSV csv into one object per row, keyed by the header row. Handles quoted commas, line breaks and `""` escapes. */
export const parseCsv = (csv: string): BricksetRow[] => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]
    if (inQuotes) {
      if (char === '"' && csv[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && csv[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  row.push(field)
  rows.push(row)

  const [headers = [], ...lines] = rows.filter((values) =>
    values.some((value) => value !== '')
  )
  return lines.map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [
        header.trim(),
        (values[index] ?? '').trim(),
      ])
    )
  )
}

export const readCsvFile = async (file: File) => parseCsv(await file.text())
