import type {
  ColDef,
  ColGroupDef,
  ColumnPinnedType,
  ColumnState,
  GridOptions,
  GridState,
} from 'ag-grid-community'

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

export const toInitialState = ({
  columnState,
  excludedColIds,
}: {
  columnState: ColumnState[]
  excludedColIds: string[]
}): GridState => {
  const getPinnedColIds = (side: Pinned) =>
    columnState
      .filter(({ pinned }) => pinned === side)
      .map(({ colId }) => colId)

  return {
    columnOrder: { orderedColIds: columnState.map(({ colId }) => colId) },
    columnPinning: {
      leftColIds: getPinnedColIds('left'),
      rightColIds: getPinnedColIds('right'),
    },
    columnSizing: {
      columnSizingModel: columnState.map(({ colId, width, flex }) => ({
        colId,
        width: width ?? undefined,
        flex: flex ?? undefined,
      })),
    },
    columnVisibility: {
      hiddenColIds: [
        ...new Set([
          ...columnState.filter(({ hide }) => hide).map(({ colId }) => colId),
          ...excludedColIds,
        ]),
      ],
    },
    sort: {
      sortModel: columnState
        .filter(({ sort }) => sort)
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
        .map(({ colId, sort }) => ({ colId, sort: sort ?? 'asc' })),
    },
  }
}

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
