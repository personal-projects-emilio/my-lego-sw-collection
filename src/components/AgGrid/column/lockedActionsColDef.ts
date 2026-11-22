import type { ColDef } from 'ag-grid-community'

export const lockedActionsColDef = {
  lockPinned: true,
  lockVisible: true,
  pinned: 'right',
  suppressMovable: true,
} as const satisfies ColDef
