import { useState } from 'react'
import { MdClose, MdRestartAlt } from 'react-icons/md'

import {
  Alert,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Typography,
} from '@mui/material'
import type { GridApi } from 'ag-grid-community'
import SearchField from 'components/inputs/SearchField'
import { toggleableColIds, toShowAllState } from 'utils/columnLayout'

import useColumnChooserStyles from './ColumnChooser.styles'
import ColumnChooserList from './ColumnChooserList'
import useChooserColumns from './useChooserColumns'

export type ColumnChooserProps<TData> = {
  api: GridApi<TData>
  excludedColIds: string[]
  saveError?: string
  titleId: string
  onClearSaveError: () => void
  onClose: () => void
  onReset: () => void
}

const ColumnChooser = <TData,>({
  api,
  excludedColIds,
  saveError,
  titleId,
  onClearSaveError,
  onClose,
  onReset,
}: ColumnChooserProps<TData>) => {
  const { classes } = useColumnChooserStyles()
  const [search, setSearch] = useState('')
  const columns = useChooserColumns({ api, excludedColIds })
  const showAll = toShowAllState(columns)

  return (
    <>
      <div className={classes.header}>
        <Typography
          className={classes.title}
          component="h2"
          id={titleId}
          variant="h6"
        >
          Columns
        </Typography>
        <IconButton aria-label="Close the column chooser" onClick={onClose}>
          <MdClose />
        </IconButton>
      </div>
      {saveError && (
        <Alert
          className={classes.alert}
          onClose={onClearSaveError}
          severity="error"
        >
          {saveError}
        </Alert>
      )}
      <div className={classes.controls}>
        <SearchField
          label="Search columns"
          onChange={setSearch}
          value={search}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showAll === 'checked'}
              indeterminate={showAll === 'indeterminate'}
              onChange={() =>
                api.setColumnsVisible(
                  toggleableColIds(columns),
                  showAll !== 'checked'
                )
              }
              size="small"
            />
          }
          label="Show all"
        />
      </div>
      <Divider />
      <ColumnChooserList api={api} columns={columns} search={search} />
      <div className={classes.footer}>
        <Button color="error" onClick={onReset} startIcon={<MdRestartAlt />}>
          Reset columns
        </Button>
      </div>
    </>
  )
}

export default ColumnChooser
