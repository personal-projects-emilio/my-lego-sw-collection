import { type ChangeEvent, type FC, useMemo, useState } from 'react'
import { MdUpload } from 'react-icons/md'

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import {
  useBricksetIgnoreListMutation,
  useBricksetIgnoreListQuery,
} from 'api/brickset'
import { useSetsQuery } from 'api/sets'
import { defaultSetFormValues } from 'pages/Sets/components/SetFormModal/SetFormModal.constant'
import { useSetsMutations } from 'pages/Sets/hooks'
import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import { uniqueAndSortedArray } from 'utils/array'
import {
  bricksetRowKey,
  bricksetRowToSetId,
  buildBricksetReport,
  changeKey,
  newSetFromBricksetRow,
  skipChanges,
} from 'utils/brickset'
import { readCsvFile } from 'utils/csv'

import IgnoredRowsTable from './IgnoredRowsTable'
import IgnoreListFields from './IgnoreListFields'
import MissingSetsTable from './MissingSetsTable'
import ReportSection from './ReportSection'
import UpdatesGrid from './UpdatesGrid'

const ImportBricksetCsv: FC = () => {
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string>()
  const [rows, setRows] = useState<BricksetRow[]>()
  const [editedIgnoreList, setEditedIgnoreList] = useState<BricksetIgnoreList>()
  const [addedKeys, setAddedKeys] = useState<string[]>([])
  const [skippedKeys, setSkippedKeys] = useState<string[]>([])
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

  const newSetIds = useMemo(
    () =>
      new Map(
        report?.missing.map((row) => [
          row,
          bricksetRowToSetId(row, {
            rows: rows ?? [],
            setsList: setsList ?? [],
          }),
        ])
      ),
    [report, rows, setsList]
  )

  const addedSets = useMemo(
    () =>
      report?.missing
        .filter((row) => addedKeys.includes(bricksetRowKey(row)))
        .map((row) =>
          newSetFromBricksetRow(
            row,
            defaultSetFormValues(undefined),
            newSetIds.get(row) ?? bricksetRowKey(row)
          )
        ) ?? [],
    [report, addedKeys, newSetIds]
  )

  const changeKeysBySet =
    report?.updates.map(({ set, changes }) =>
      changes.map(({ field }) => changeKey(set.id, field))
    ) ?? []
  const isApplied = (key: string) => !skippedKeys.includes(key)
  const changesCount = changeKeysBySet.flat().length
  const appliedChangesCount = changeKeysBySet.flat().filter(isApplied).length
  const appliedUpdatesCount = changeKeysBySet.filter((keys) =>
    keys.some(isApplied)
  ).length

  const toggleAdded = (keys: string[], isAdded: boolean) =>
    setAddedKeys((previousKeys) =>
      isAdded
        ? previousKeys.filter((key) => !keys.includes(key))
        : uniqueAndSortedArray([...previousKeys, ...keys])
    )

  const onClose = () => {
    setOpen(false)
    setFileName(undefined)
    setRows(undefined)
    setEditedIgnoreList(undefined)
    setAddedKeys([])
    setSkippedKeys([])
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

  const addToIgnoreList = (key: keyof BricksetIgnoreList, value: string) =>
    ignoreList &&
    updateIgnoreList(key, uniqueAndSortedArray([...ignoreList[key], value]))

  const onValidate = async () => {
    if (!report || !ignoreList) return
    await saveIgnoreList(ignoreList)
    if (appliedUpdatesCount > 0 || addedSets.length > 0) {
      await editSetsList(
        [...skipChanges(report, skippedKeys), ...addedSets].sort((a, b) =>
          String(a.id).localeCompare(String(b.id), undefined, {
            numeric: true,
          })
        )
      )
    }
    onClose()
  }

  const hasChanges = Boolean(
    editedIgnoreList || appliedUpdatesCount || addedSets.length
  )

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
              <IgnoreListFields
                ignoreList={ignoreList}
                isError={isIgnoreListError}
                rows={rows}
                onChange={updateIgnoreList}
              />
              {report && (
                <div>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    {appliedUpdatesCount} sets will be updated,{' '}
                    {addedSets.length} added, {report.unchangedCount} are
                    already up to date.
                  </Alert>
                  <ReportSection
                    title="Will be updated"
                    count={report.updates.length}
                    countLabel={`${appliedChangesCount}/${changesCount} changes in ${appliedUpdatesCount}/${report.updates.length} sets`}
                  >
                    <UpdatesGrid
                      updates={report.updates}
                      skippedKeys={skippedKeys}
                      onSkippedKeysChange={setSkippedKeys}
                    />
                  </ReportSection>
                  <ReportSection
                    title="In the CSV but not in the collection"
                    count={report.missing.length}
                  >
                    <MissingSetsTable
                      rows={report.missing}
                      newSetIds={newSetIds}
                      addedKeys={addedKeys}
                      onToggleAdded={toggleAdded}
                      onIgnore={addToIgnoreList}
                    />
                  </ReportSection>
                  <ReportSection title="Ignored" count={report.ignored.length}>
                    <IgnoredRowsTable ignored={report.ignored} />
                  </ReportSection>
                  <ReportSection
                    title="In the collection but not in the CSV"
                    count={report.notInCsv.length}
                  >
                    <Typography>
                      {report.notInCsv.map(({ id }) => id).join(', ')}
                    </Typography>
                  </ReportSection>
                  <ReportSection
                    title="Several CSV rows match, not updated"
                    count={report.conflicts.length}
                  >
                    <Typography>
                      {report.conflicts.map(({ id }) => id).join(', ')}
                    </Typography>
                  </ReportSection>
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
