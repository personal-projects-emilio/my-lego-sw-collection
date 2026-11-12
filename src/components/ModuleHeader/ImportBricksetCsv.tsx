import {
  type ChangeEvent,
  type FC,
  type ReactNode,
  useMemo,
  useState,
} from 'react'
import { MdExpandMore, MdUpload } from 'react-icons/md'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import type { ColDef } from 'ag-grid-community'
import {
  useBricksetIgnoreListMutation,
  useBricksetIgnoreListQuery,
} from 'api/brickset'
import { useSetsQuery } from 'api/sets'
import { AgGridTable } from 'components/AgGrid/table'
import { Autocomplete } from 'components/inputs'
import { useSetsMutations } from 'pages/Sets/hooks'
import { makeStyles } from 'tss-react/mui'
import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import { uniqueAndSortedArray } from 'utils/array'
import { buildBricksetReport, type FieldChange } from 'utils/brickset'
import { readCsvFile } from 'utils/csv'

const ignoreFields = [
  { key: 'numbers', label: 'Ignored numbers', column: 'Number' },
  { key: 'themes', label: 'Ignored themes', column: 'Theme' },
  { key: 'subthemes', label: 'Ignored subthemes', column: 'Subtheme' },
] as const satisfies {
  key: keyof BricksetIgnoreList
  label: string
  column: string
}[]

type UpdateRow = {
  id: string
  name: string
  field: string
  from: FieldChange['from']
  to: FieldChange['to']
  change: number | null
}

const defaultUpdateColDef = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  suppressFloatingFilterButton: true,
  suppressHeaderFilterButton: true,
} as const satisfies ColDef<UpdateRow>

const updateColumnDefs: ColDef<UpdateRow>[] = [
  { field: 'id', headerName: 'Set', maxWidth: 110 },
  { field: 'name', headerName: 'Name', flex: 2 },
  { field: 'field', headerName: 'Field', flex: 1, minWidth: 240 },
  {
    field: 'from',
    headerName: 'Current',
    valueFormatter: ({ value }) => formatValue(value),
    maxWidth: 130,
  },
  {
    field: 'to',
    headerName: 'New',
    valueFormatter: ({ value }) => formatValue(value),
    maxWidth: 130,
  },
  {
    field: 'change',
    headerName: 'Change',
    filter: 'agNumberColumnFilter',
    valueFormatter: ({ value }) =>
      value === null || value === undefined
        ? ''
        : (value > 0 ? '+' : '') + Number(value.toFixed(2)),
    maxWidth: 130,
  },
]

const useStyles = makeStyles({ name: 'ImportBricksetCsv' })({
  updatesGrid: { height: 450, maxHeight: 450, padding: 0 },
})

const rowLabel = ({ Number, Variant, SetName }: BricksetRow) =>
  `${Number}-${Variant} ${SetName ?? ''}`

const formatValue = (value: unknown) =>
  value === null || value === undefined || value === '' ? '—' : String(value)

const Section: FC<{ title: string; count: number; children: ReactNode }> = ({
  title,
  count,
  children,
}) => (
  <Accordion disabled={count === 0} disableGutters>
    <AccordionSummary expandIcon={<MdExpandMore />}>
      <Typography>
        {title} ({count})
      </Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
)

const ImportBricksetCsv: FC = () => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string>()
  const [rows, setRows] = useState<BricksetRow[]>()
  const [editedIgnoreList, setEditedIgnoreList] = useState<BricksetIgnoreList>()
  const { data: setsList } = useSetsQuery()
  const { data: savedIgnoreList, isError: isIgnoreListError } =
    useBricksetIgnoreListQuery()
  const { editSetsList, isPending: isSetsPending } = useSetsMutations()
  const { mutateAsync: saveIgnoreList, isPending: isIgnoreListPending } =
    useBricksetIgnoreListMutation()

  const ignoreList = editedIgnoreList ?? savedIgnoreList
  const report = useMemo(
    () =>
      rows &&
      setsList &&
      ignoreList &&
      buildBricksetReport({ rows, setsList, ignoreList }),
    [rows, setsList, ignoreList]
  )

  const updateRows = useMemo(
    () =>
      report?.updates.flatMap(({ set, changes }) =>
        changes.map(({ field, from, to }): UpdateRow => ({
          id: String(set.id),
          name: set.name,
          field,
          from,
          to,
          change:
            typeof from === 'number' && typeof to === 'number'
              ? to - from
              : null,
        }))
      ) ?? [],
    [report]
  )

  const onClose = () => {
    setOpen(false)
    setFileName(undefined)
    setRows(undefined)
    setEditedIgnoreList(undefined)
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFileName(file.name)
    setRows(await readCsvFile(file))
  }

  const updateIgnoreList = (key: keyof BricksetIgnoreList, values: string[]) =>
    ignoreList && setEditedIgnoreList({ ...ignoreList, [key]: values })

  const onValidate = async () => {
    if (!report) return
    if (editedIgnoreList) await saveIgnoreList(editedIgnoreList)
    if (report.updates.length > 0) await editSetsList(report.setsList)
    onClose()
  }

  const hasChanges = Boolean(editedIgnoreList || report?.updates.length)

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<MdUpload />}
        onClick={() => setOpen(true)}
      >
        Import CSV
      </Button>
      {open && (
        <Dialog
          open
          onClose={onClose}
          aria-labelledby="brickset-import-dialog"
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle id="brickset-import-dialog">
            Import a Brickset CSV
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<MdUpload />}
                >
                  Choose CSV
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={onFileChange}
                  />
                </Button>
                <Typography color="text.secondary">
                  {fileName
                    ? `${fileName}: ${rows?.length ?? 0} rows`
                    : 'Export your sets from Brickset as CSV'}
                </Typography>
              </Stack>
              {ignoreList ? (
                ignoreFields.map(({ key, label, column }) => (
                  <Autocomplete
                    key={key}
                    multiple
                    freeSolo
                    options={uniqueAndSortedArray(
                      (rows ?? []).map((row) => row[column]).filter(Boolean)
                    )}
                    value={ignoreList[key]}
                    onChange={(values) =>
                      updateIgnoreList(key, (values as string[] | null) ?? [])
                    }
                    textFieldProps={{ label, size: 'small' }}
                  />
                ))
              ) : isIgnoreListError ? (
                <Alert severity="error">
                  Unable to load the ignore list. Check that you are logged in
                  and allowed to read /bricksetIgnoreList.
                </Alert>
              ) : (
                <Typography color="text.secondary">
                  Loading the ignore list…
                </Typography>
              )}
              {report && (
                <div>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    {report.updates.length} sets will be updated,{' '}
                    {report.unchangedCount} are already up to date.
                  </Alert>
                  <Section
                    title="Will be updated"
                    count={report.updates.length}
                  >
                    <AgGridTable
                      className={classes.updatesGrid}
                      rowData={updateRows}
                      columnDefs={updateColumnDefs}
                      defaultColDef={defaultUpdateColDef}
                      autoSizeStrategy={{ type: 'fitGridWidth' }}
                    />
                  </Section>
                  <Section
                    title="In the CSV but not in the collection"
                    count={report.missing.length}
                  >
                    <Table size="small">
                      <TableBody>
                        {report.missing.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{rowLabel(row)}</TableCell>
                            <TableCell>
                              {row.Theme} / {row.Subtheme}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                onClick={() =>
                                  ignoreList &&
                                  updateIgnoreList(
                                    'numbers',
                                    uniqueAndSortedArray([
                                      ...ignoreList.numbers,
                                      row.Number,
                                    ])
                                  )
                                }
                              >
                                Ignore
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Section>
                  <Section title="Ignored" count={report.ignored.length}>
                    <Table size="small">
                      <TableBody>
                        {report.ignored.map(({ row, reason }, index) => (
                          <TableRow key={index}>
                            <TableCell>{rowLabel(row)}</TableCell>
                            <TableCell>Ignored by {reason}</TableCell>
                            <TableCell>
                              {row.Theme} / {row.Subtheme}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Section>
                  <Section
                    title="In the collection but not in the CSV"
                    count={report.notInCsv.length}
                  >
                    <Typography>
                      {report.notInCsv.map(({ id }) => id).join(', ')}
                    </Typography>
                  </Section>
                  <Section
                    title="Several CSV rows match, not updated"
                    count={report.conflicts.length}
                  >
                    <Typography>
                      {report.conflicts.map(({ id }) => id).join(', ')}
                    </Typography>
                  </Section>
                </div>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={onValidate}
              color="primary"
              variant="contained"
              disabled={!hasChanges}
              loading={isSetsPending || isIgnoreListPending}
            >
              Validate changes in DB
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default ImportBricksetCsv
