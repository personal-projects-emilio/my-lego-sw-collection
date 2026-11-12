import type { FC } from 'react'

import { Alert, Typography } from '@mui/material'
import { Autocomplete } from 'components/inputs'
import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import { uniqueAndSortedArray } from 'utils/array'

import { ignoreFields } from './ImportBricksetCsv.constants'

type IgnoreListFieldsProps = {
  ignoreList: BricksetIgnoreList | undefined
  isError: boolean
  rows: BricksetRow[] | undefined
  onChange: (key: keyof BricksetIgnoreList, values: string[]) => void
}

const IgnoreListFields: FC<IgnoreListFieldsProps> = ({
  ignoreList,
  isError,
  rows,
  onChange,
}) => {
  if (isError && !ignoreList) {
    return (
      <Alert severity="error">
        Unable to load the ignore list. Check that you are logged in and allowed
        to read /bricksetIgnoreList.
      </Alert>
    )
  }
  if (!ignoreList) {
    return (
      <Typography color="text.secondary">Loading the ignore list…</Typography>
    )
  }
  return ignoreFields.map(({ key, label, column }) => (
    <Autocomplete
      key={key}
      multiple
      freeSolo
      options={uniqueAndSortedArray(
        (rows ?? []).map((row) => row[column]).filter(Boolean)
      )}
      value={ignoreList[key]}
      onChange={(values) => onChange(key, (values as string[] | null) ?? [])}
      textFieldProps={{ label, size: 'small' }}
    />
  ))
}

export default IgnoreListFields
