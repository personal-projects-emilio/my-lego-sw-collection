import { type ChangeEvent, type FC, useMemo, useState } from 'react'
import { MdUpload } from 'react-icons/md'

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import {
  useBricksetIgnoreListMutation,
  useBricksetIgnoreListQuery,
} from 'api/brickset'
import { useSetsQuery } from 'api/sets'
import { defaultSetFormValues } from 'pages/Sets/components/SetFormModal/SetFormModal.constant'
import { useSetsMutations } from 'pages/Sets/hooks'
import { makeStyles } from 'tss-react/mui'
import type { BricksetIgnoreList, BricksetRow } from 'types/brickset'
import { compareIds, uniqueAndSortedArray } from 'utils/array'
import {
  bricksetRowKey,
  bricksetRowToSetId,
  buildBricksetReport,
  changeKey,
  newSetFromBricksetRow,
  skipChanges,
} from 'utils/brickset'
import { readCsvFile } from 'utils/csv'

import IgnoredRowsGrid from './IgnoredRowsGrid'
import IgnoreListFields from './IgnoreListFields'
import MissingSetsGrid from './MissingSetsGrid'
import ReportSection from './ReportSection'
import SetsGrid from './SetsGrid'
import UpdatesGrid from './UpdatesGrid'

const useImportBricksetCsvStyles = makeStyles({ name: 'ImportBricksetCsv' })(
  (theme) => ({
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
    fileRow: {
      alignItems: 'center',
      display: 'flex',
      gap: theme.spacing(2),
    },
    summary: {
      marginBottom: theme.spacing(1),
    },
  })
)

const ImportBricksetCsv: FC = () => {
  const { classes } = useImportBricksetCsvStyles()
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
          bricksetRowToSetId({
            row,
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
          newSetFromBricksetRow({
            row,
            base: defaultSetFormValues(undefined),
            id: newSetIds.get(row) ?? bricksetRowKey(row),
          })
        ) ?? [],
    [report, addedKeys, newSetIds]
  )

  const changeKeysBySet =
    report?.updates.map(({ set, changes }) =>
      changes.map(({ field }) => changeKey({ id: set.id, field }))
    ) ?? []
  const isApplied = (key: string) => !skippedKeys.includes(key)
  const changesCount = changeKeysBySet.flat().length
  const appliedChangesCount = changeKeysBySet.flat().filter(isApplied).length
  const appliedUpdatesCount = changeKeysBySet.filter((keys) =>
    keys.some(isApplied)
  ).length

  const toggleAdded = ({
    keys,
    isAdded,
  }: {
    keys: string[]
    isAdded: boolean
  }) =>
    setAddedKeys((previousKeys) =>
      isAdded
        ? previousKeys.filter((key) => !keys.includes(key))
        : uniqueAndSortedArray({ array: [...previousKeys, ...keys] })
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

  const updateIgnoreList = ({
    key,
    values,
  }: {
    key: keyof BricksetIgnoreList
    values: string[]
  }) => ignoreList && setEditedIgnoreList({ ...ignoreList, [key]: values })

  const addToIgnoreList = ({
    key,
    value,
  }: {
    key: keyof BricksetIgnoreList
    value: string
  }) =>
    ignoreList &&
    updateIgnoreList({
      key,
      values: uniqueAndSortedArray({ array: [...ignoreList[key], value] }),
    })

  const onValidate = async () => {
    if (!report || !ignoreList) return
    await saveIgnoreList(ignoreList)
    if (appliedUpdatesCount > 0 || addedSets.length > 0) {
      await editSetsList(
        [...skipChanges({ report, skippedKeys }), ...addedSets].sort((a, b) =>
          compareIds(a.id, b.id)
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
            <div className={classes.content}>
              <div className={classes.fileRow}>
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
                <Typography color="textSecondary">
                  {fileName
                    ? `${fileName}: ${rows?.length ?? 0} rows`
                    : 'Export your sets from Brickset as CSV'}
                </Typography>
              </div>
              <IgnoreListFields
                ignoreList={ignoreList}
                isError={isIgnoreListError}
                rows={rows}
                onChange={updateIgnoreList}
              />
              {report && (
                <div>
                  <Alert className={classes.summary} severity="info">
                    {appliedUpdatesCount} sets will be updated,{' '}
                    {addedSets.length} added, {report.unchangedCount} are
                    already up to date.
                  </Alert>
                  <ReportSection
                    title="Will Be Updated"
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
                    title="In the CSV but Not in the Collection"
                    count={report.missing.length}
                  >
                    <MissingSetsGrid
                      rows={report.missing}
                      newSetIds={newSetIds}
                      addedKeys={addedKeys}
                      onToggleAdded={toggleAdded}
                      onIgnore={addToIgnoreList}
                    />
                  </ReportSection>
                  <ReportSection title="Ignored" count={report.ignored.length}>
                    <IgnoredRowsGrid ignored={report.ignored} />
                  </ReportSection>
                  <ReportSection
                    title="In the Collection but Not in the CSV"
                    count={report.notInCsv.length}
                  >
                    <SetsGrid sets={report.notInCsv} />
                  </ReportSection>
                  <ReportSection
                    title="Several CSV Rows Match, Not Updated"
                    count={report.conflicts.length}
                  >
                    <SetsGrid sets={report.conflicts} />
                  </ReportSection>
                </div>
              )}
            </div>
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
