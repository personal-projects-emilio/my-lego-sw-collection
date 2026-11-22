import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdClose,
  MdFitScreen,
  MdPushPin,
  MdRemove,
  MdRestartAlt,
  MdSwapVert,
  MdViewColumn,
  MdVisibilityOff,
  MdWidthNormal,
} from 'react-icons/md'

import type { Column, GridApi } from 'ag-grid-community'
import type { CustomHeaderProps } from 'ag-grid-react'
import type { MenuItemDefinition } from 'components/Menu'
import { countSorts, type Pinned, toPinned } from 'utils/columnLayout'

const directions = [
  { sort: 'asc', label: 'Ascending', icon: <MdArrowUpward /> },
  { sort: 'desc', label: 'Descending', icon: <MdArrowDownward /> },
  { sort: null, label: 'None', icon: <MdRemove /> },
] as const

const pinSides: { pinned?: Pinned; label: string }[] = [
  { pinned: 'left', label: 'Left' },
  { pinned: 'right', label: 'Right' },
  { label: 'None' },
]

export const headerMenuItems = ({
  api,
  column,
  openColumnChooser,
  requestReset,
  setSort,
}: {
  api: GridApi
  column: Column
  setSort: CustomHeaderProps['setSort']
  openColumnChooser?: () => void
  requestReset?: () => void
}): MenuItemDefinition[] => {
  const colId = column.getColId()
  const { lockPinned, lockVisible } = column.getColDef()
  const state = api.getColumnState()
  const sortCount = countSorts(state)
  const isSortedElsewhere = state.some(
    (columnState) => columnState.sort && columnState.colId !== colId
  )
  const currentSort = column.getSort() ?? null
  const pinned = toPinned(column.getPinned())

  const sortItems = ({
    key,
    multiSort,
  }: {
    key: string
    multiSort: boolean
  }): MenuItemDefinition[] =>
    directions.map(({ sort, label, icon }) => ({
      kind: 'radio',
      key: `${key}-${sort}`,
      label,
      icon,
      checked: currentSort === sort,
      onClick: () => setSort(sort, multiSort),
    }))

  return [
    {
      kind: 'submenu',
      key: 'sortBy',
      label: 'Sort by',
      icon: <MdSwapVert />,
      shortcut: 'Click',
      disabled: !column.isSortable(),
      items: sortItems({ key: 'sortBy', multiSort: false }),
    },
    {
      kind: 'submenu',
      key: 'addSortBy',
      label: 'Add sort by',
      icon: <MdAdd />,
      shortcut: 'Shift+Click',
      disabled: !column.isSortable() || !isSortedElsewhere,
      items: sortItems({ key: 'addSortBy', multiSort: true }),
    },
    {
      kind: 'action',
      key: 'clearSorts',
      label: sortCount ? `Clear all sorts (${sortCount})` : 'Clear all sorts',
      icon: <MdClose />,
      disabled: sortCount === 0,
      onClick: () => api.applyColumnState({ defaultState: { sort: null } }),
    },
    { kind: 'divider', key: 'pinDivider' },
    {
      kind: 'submenu',
      key: 'pin',
      label: 'Pin column',
      icon: <MdPushPin />,
      disabled: !!lockPinned,
      items: pinSides.map((side) => ({
        kind: 'radio',
        key: `pin-${side.label}`,
        label: side.label,
        checked: pinned === side.pinned,
        onClick: () => api.setColumnsPinned([colId], side.pinned ?? null),
      })),
    },
    { kind: 'divider', key: 'sizeDivider' },
    {
      kind: 'action',
      key: 'autosize',
      label: 'Autosize this column',
      icon: <MdWidthNormal />,
      onClick: () => api.autoSizeColumns([colId]),
    },
    {
      kind: 'action',
      key: 'autosizeAll',
      label: 'Autosize all columns',
      icon: <MdFitScreen />,
      onClick: () => api.autoSizeAllColumns(),
    },
    { kind: 'divider', key: 'columnsDivider' },
    {
      kind: 'action',
      key: 'hide',
      label: 'Hide column',
      icon: <MdVisibilityOff />,
      disabled: !!lockVisible,
      onClick: () => api.setColumnsVisible([colId], false),
    },
    ...(openColumnChooser && requestReset
      ? ([
          {
            kind: 'action',
            key: 'chooseColumns',
            label: 'Choose columns',
            icon: <MdViewColumn />,
            onClick: openColumnChooser,
          },
          {
            kind: 'action',
            key: 'resetColumns',
            label: 'Reset columns',
            icon: <MdRestartAlt />,
            destructive: true,
            onClick: requestReset,
          },
        ] as const)
      : []),
  ]
}
