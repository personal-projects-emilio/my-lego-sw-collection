import { useState } from 'react'
import { MdRestartAlt } from 'react-icons/md'

import { Alert, Button, Checkbox } from '@mui/material'
import type { GridApi } from 'ag-grid-community'
import SearchField from 'components/inputs/SearchField'
import { getToggleableColIds, toShowAllState } from 'utils/columnLayout'

import useColumnChooserStyles from './ColumnChooser.styles'
import ColumnChooserList from './ColumnChooserList'
import useChooserColumns from './useChooserColumns'

export type ColumnChooserProps<TData> = {
  api: GridApi<TData>
  saveError?: string
  onClearSaveError: () => void
  onReset: () => void
}

const ColumnChooser = <TData,>({
  api,
  saveError,
  onClearSaveError,
  onReset,
}: ColumnChooserProps<TData>) => {
  const { classes } = useColumnChooserStyles()
  const [search, setSearch] = useState('')
  const columns = useChooserColumns(api)
  const showAll = toShowAllState(columns)

  return (
    <div className={classes.chooser}>
      {saveError && (
        <Alert
          className={classes.alert}
          onClose={onClearSaveError}
          severity="error"
        >
          {saveError}
        </Alert>
      )}
      <Checkbox
        className={classes.showAll}
        checked={showAll === 'checked'}
        indeterminate={showAll === 'indeterminate'}
        onChange={() =>
          api.setColumnsVisible(
            getToggleableColIds(columns),
            showAll !== 'checked'
          )
        }
        size="small"
        slotProps={{
          input: {
            'aria-label': 'Show all columns',
            ref: (input: HTMLInputElement | null) => {
              if (input) input.indeterminate = showAll === 'indeterminate'
            },
          },
        }}
      />
      <search className={classes.search}>
        <SearchField
          label="Search columns"
          onChange={setSearch}
          value={search}
        />
      </search>
      <ColumnChooserList api={api} columns={columns} search={search} />
      <footer className={classes.footer}>
        <Button color="error" onClick={onReset} startIcon={<MdRestartAlt />}>
          Reset columns
        </Button>
      </footer>
    </div>
  )
}

export default ColumnChooser
