import type {
  ColDef,
  ColGroupDef,
  ColumnPinnedType,
  ColumnState,
  GridOptions,
  GridState,
} from 'ag-grid-community'
import type { ColumnLayout, SavedColumnLayout } from 'types/columnLayout'

export type Pinned = 'left' | 'right'

export type ChooserColumn = {
  colId: string
  headerName: string
  hide: boolean
  pinned?: Pinned
  isLockedVisible: boolean
  isLockedPosition: boolean
}

export type ChooserGroups = Record<Pinned | 'center', ChooserColumn[]>

export type ShowAllState = 'checked' | 'unchecked' | 'indeterminate'

export const toPinned = (pinned: ColumnPinnedType): Pinned | undefined =>
  pinned === true ? 'left' : pinned || undefined

export const isExcluded = <TData>(
  columnDef: ColDef<TData> | ColGroupDef<TData>
): columnDef is ColDef<TData> & { context: { isExcluded: true } } =>
  !('children' in columnDef) && !!columnDef.context?.isExcluded

export const toColumnLayout = ({
  state,
  excludedColIds = [],
  previous,
}: {
  state: SavedColumnLayout
  excludedColIds?: string[]
  previous?: ColumnLayout | null
}): ColumnLayout => ({
  columnOrder: { orderedColIds: state.columnOrder?.orderedColIds ?? [] },
  columnPinning: {
    leftColIds: state.columnPinning?.leftColIds ?? [],
    rightColIds: state.columnPinning?.rightColIds ?? [],
  },
  columnSizing: {
    columnSizingModel: state.columnSizing?.columnSizingModel ?? [],
  },
  columnVisibility: {
    hiddenColIds: [
      ...(state.columnVisibility?.hiddenColIds ?? []).filter(
        (colId) => !excludedColIds.includes(colId)
      ),
      ...(previous?.columnVisibility.hiddenColIds ?? []).filter((colId) =>
        excludedColIds.includes(colId)
      ),
    ],
  },
  sort: { sortModel: state.sort?.sortModel ?? [] },
})

export const toInitialState = ({
  layout,
  excludedColIds,
}: {
  layout?: ColumnLayout | null
  excludedColIds: string[]
}): GridState | undefined =>
  layout
    ? {
        ...layout,
        columnVisibility: {
          hiddenColIds: [
            ...new Set([
              ...layout.columnVisibility.hiddenColIds,
              ...excludedColIds,
            ]),
          ],
        },
      }
    : undefined

export const hideExcluded = <TData>(
  columnDefs: GridOptions<TData>['columnDefs']
) =>
  columnDefs?.map((columnDef) =>
    isExcluded(columnDef) ? { ...columnDef, hide: true } : columnDef
  )

export const toExcludedColIds = <TData>(
  columnDefs: GridOptions<TData>['columnDefs']
): string[] =>
  (columnDefs ?? []).flatMap((columnDef) =>
    isExcluded(columnDef) ? [columnDef.colId ?? String(columnDef.field)] : []
  )

export const countSorts = (state: ColumnState[]) =>
  state.filter(({ sort }) => sort).length

export const groupColumns = (columns: ChooserColumn[]): ChooserGroups => ({
  left: columns.filter(({ pinned }) => pinned === 'left'),
  center: columns.filter(({ pinned }) => !pinned),
  right: columns.filter(({ pinned }) => pinned === 'right'),
})

export const canMoveColumn = ({
  columns,
  activeColId,
  overColId,
}: {
  columns: ChooserColumn[]
  activeColId: string
  overColId: string
}) => {
  const active = columns.find(({ colId }) => colId === activeColId)
  const over = columns.find(({ colId }) => colId === overColId)
  return (
    !!active &&
    !!over &&
    active !== over &&
    active.pinned === over.pinned &&
    !active.isLockedPosition
  )
}

const getToggleableColumns = (columns: ChooserColumn[]) =>
  columns.filter(({ isLockedVisible }) => !isLockedVisible)

export const getToggleableColIds = (columns: ChooserColumn[]) =>
  getToggleableColumns(columns).map(({ colId }) => colId)

export const toShowAllState = (columns: ChooserColumn[]): ShowAllState => {
  const toggleable = getToggleableColumns(columns)
  const shown = toggleable.filter(({ hide }) => !hide).length
  if (shown === 0) return 'unchecked'
  return shown === toggleable.length ? 'checked' : 'indeterminate'
}
