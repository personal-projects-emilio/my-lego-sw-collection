import type {
  ApplyColumnStateParams,
  ColDef,
  ColGroupDef,
  ColumnPinnedType,
  ColumnState,
  SortDirection,
} from 'ag-grid-community'
import type { ColumnLayout, SavedColumnState } from 'types/columnLayout'

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

const withoutEmpty = <Item extends object>(item: Item) =>
  Object.fromEntries(
    Object.entries(item).filter(([, value]) => value != null)
  ) as Item

export const toSavedColumnState = ({
  colId,
  hide,
  width,
  flex,
  pinned,
  sort,
  sortIndex,
}: ColumnState): SavedColumnState =>
  withoutEmpty({
    colId,
    hide: Boolean(hide),
    width: width ?? undefined,
    flex: flex ?? undefined,
    pinned: toPinned(pinned),
    sort: sort ?? undefined,
    sortIndex: sort ? (sortIndex ?? undefined) : undefined,
  })

export const toColumnLayout = ({
  state,
  excludedColIds,
  saved,
}: {
  state: ColumnState[]
  excludedColIds: string[]
  saved?: ColumnLayout | null
}): ColumnLayout =>
  state.map((columnState) => {
    if (!excludedColIds.includes(columnState.colId))
      return toSavedColumnState(columnState)
    const previous = saved?.find(({ colId }) => colId === columnState.colId)
    return previous ?? { ...toSavedColumnState(columnState), hide: false }
  })

export const toApplyColumnStateParams = ({
  layout,
  excludedColIds,
}: {
  layout: ColumnLayout
  excludedColIds: string[]
}): ApplyColumnStateParams => ({
  state: [
    ...layout.map((saved): ColumnState => ({
      flex: null,
      ...saved,
      ...(excludedColIds.includes(saved.colId) && { hide: true }),
    })),
    ...excludedColIds
      .filter((colId) => !layout.some((saved) => saved.colId === colId))
      .map((colId) => ({ colId, hide: true })),
  ],
  applyOrder: true,
  defaultState: { hide: false, pinned: null, sort: null, sortIndex: null },
})

export const toVisibilityState = ({
  colIds,
  excludedColIds,
  layout,
}: {
  colIds: string[]
  excludedColIds: string[]
  layout?: ColumnLayout | null
}): ColumnState[] =>
  colIds.map((colId) => ({
    colId,
    hide:
      excludedColIds.includes(colId) ||
      Boolean(layout?.find((saved) => saved.colId === colId)?.hide),
  }))

export const toExcludedColIds = <TData>(
  columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null
): string[] =>
  (columnDefs ?? []).flatMap((columnDef) =>
    !('children' in columnDef) && columnDef.context?.isExcluded
      ? [columnDef.colId ?? String(columnDef.field)]
      : []
  )

const sortedColIds = (state: ColumnState[]) =>
  state
    .filter(({ sort }) => sort)
    .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
    .map(({ colId }) => colId)

export const countSorts = (state: ColumnState[]) => sortedColIds(state).length

export const sortBy = ({
  state,
  colId,
  sort,
}: {
  state: ColumnState[]
  colId: string
  sort: SortDirection
}): ColumnState[] =>
  state.map((columnState) => {
    const isTarget = columnState.colId === colId && !!sort
    return {
      colId: columnState.colId,
      sort: isTarget ? sort : null,
      sortIndex: isTarget ? 0 : null,
    }
  })

export const addSortBy = ({
  state,
  colId,
  sort,
}: {
  state: ColumnState[]
  colId: string
  sort: SortDirection
}): ColumnState[] => {
  const order = sortedColIds(state)
  const withoutTarget = order.filter((sortedColId) => sortedColId !== colId)
  const nextOrder = !sort
    ? withoutTarget
    : order.includes(colId)
      ? order
      : [...order, colId]
  return state.map((columnState) => {
    const index = nextOrder.indexOf(columnState.colId)
    if (index === -1)
      return { colId: columnState.colId, sort: null, sortIndex: null }
    return {
      colId: columnState.colId,
      sort: columnState.colId === colId ? sort : (columnState.sort ?? null),
      sortIndex: index,
    }
  })
}

export const clearSorts = (state: ColumnState[]): ColumnState[] =>
  state.map(({ colId }) => ({ colId, sort: null, sortIndex: null }))

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
