import type {
  ColDef,
  ColGroupDef,
  ColumnPinnedType,
  ColumnState,
  GridState,
} from 'ag-grid-community'
import type { ColumnLayout, SavedColumnLayout } from 'types/columnLayout'

export type Pinned = 'left' | 'right'

export type ChooserColumn = {
  colId: string
  headerName: string
  hide: boolean
  pinned?: Pinned
  isExcluded: boolean
  isLockedVisible: boolean
  isLockedPosition: boolean
}

export type ChooserGroups = Record<Pinned | 'center', ChooserColumn[]>

export type ShowAllState = 'checked' | 'unchecked' | 'indeterminate'

export const toPinned = (pinned: ColumnPinnedType): Pinned | undefined =>
  pinned === true ? 'left' : pinned || undefined

export const toColumnLayout = ({
  state,
  excludedColIds = [],
}: {
  state: SavedColumnLayout
  excludedColIds?: string[]
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
    hiddenColIds: (state.columnVisibility?.hiddenColIds ?? []).filter(
      (colId) => !excludedColIds.includes(colId)
    ),
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
  columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null
) =>
  columnDefs?.map((columnDef) =>
    !('children' in columnDef) && columnDef.context?.isExcluded
      ? { ...columnDef, hide: true }
      : columnDef
  )

export const toExcludedColIds = <TData>(
  columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null
): string[] =>
  (columnDefs ?? []).flatMap((columnDef) =>
    !('children' in columnDef) && columnDef.context?.isExcluded
      ? [columnDef.colId ?? String(columnDef.field)]
      : []
  )

export const countSorts = (state: ColumnState[]) =>
  state.filter(({ sort }) => sort).length

export const groupColumns = (columns: ChooserColumn[]): ChooserGroups => {
  const visible = columns.filter(({ isExcluded }) => !isExcluded)
  return {
    left: visible.filter(({ pinned }) => pinned === 'left'),
    center: visible.filter(({ pinned }) => !pinned),
    right: visible.filter(({ pinned }) => pinned === 'right'),
  }
}

export const moveColumn = ({
  columns,
  activeColId,
  overColId,
}: {
  columns: ChooserColumn[]
  activeColId: string
  overColId: string
}): string[] | undefined => {
  const active = columns.find(({ colId }) => colId === activeColId)
  const over = columns.find(({ colId }) => colId === overColId)
  if (!active || !over || active === over) return undefined
  if (active.pinned !== over.pinned || active.isLockedPosition) return undefined
  const colIds = columns.map(({ colId }) => colId)
  const to = colIds.indexOf(overColId)
  const withoutActive = colIds.filter((colId) => colId !== activeColId)
  return [
    ...withoutActive.slice(0, to),
    activeColId,
    ...withoutActive.slice(to),
  ]
}

const toggleableColumns = (columns: ChooserColumn[]) =>
  columns.filter(
    ({ isExcluded, isLockedVisible }) => !isExcluded && !isLockedVisible
  )

export const toggleableColIds = (columns: ChooserColumn[]) =>
  toggleableColumns(columns).map(({ colId }) => colId)

export const toShowAllState = (columns: ChooserColumn[]): ShowAllState => {
  const toggleable = toggleableColumns(columns)
  const shown = toggleable.filter(({ hide }) => !hide).length
  if (shown === 0) return 'unchecked'
  return shown === toggleable.length ? 'checked' : 'indeterminate'
}
