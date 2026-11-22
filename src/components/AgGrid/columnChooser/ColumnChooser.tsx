import { useState } from 'react'
import { MdClose, MdRestartAlt } from 'react-icons/md'

import { Alert, Button, Checkbox, IconButton, Typography } from '@mui/material'
import type { GridApi } from 'ag-grid-community'
import SearchField from 'components/inputs/SearchField'
import { toggleableColIds, toShowAllState } from 'utils/columnLayout'

import useColumnChooserStyles from './ColumnChooser.styles'
import ColumnChooserList from './ColumnChooserList'
import useChooserColumns from './useChooserColumns'

export type ColumnChooserProps<TData> = {
  api: GridApi<TData>
  saveError?: string
  titleId: string
  onClearSaveError: () => void
  onClose: () => void
  onReset: () => void
}

const ColumnChooser = <TData,>({
  api,
  saveError,
  titleId,
  onClearSaveError,
  onClose,
  onReset,
}: ColumnChooserProps<TData>) => {
  const { classes } = useColumnChooserStyles()
  const [search, setSearch] = useState('')
  const columns = useChooserColumns(api)
  const showAll = toShowAllState(columns)

  return (
    <>
      <header className={classes.header}>
        <Typography
          className={classes.title}
          component="h2"
          id={titleId}
          variant="subtitle2"
        >
          Columns
        </Typography>
        <IconButton
          aria-label="Close the column chooser"
          onClick={onClose}
          size="small"
        >
          <MdClose />
        </IconButton>
      </header>
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
            toggleableColIds(columns),
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
    </>
  )
}

export default ColumnChooser
