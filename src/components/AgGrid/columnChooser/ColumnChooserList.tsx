import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Typography } from '@mui/material'
import type { GridApi } from 'ag-grid-community'
import {
  type ChooserColumn,
  type ChooserGroups,
  groupColumns,
  moveColumn,
} from 'utils/columnLayout'

import useColumnChooserStyles from './ColumnChooser.styles'
import ColumnChooserRow from './ColumnChooserRow'

const groupLabels: { group: keyof ChooserGroups; label: string }[] = [
  { group: 'left', label: 'Pinned left' },
  { group: 'center', label: 'Columns' },
  { group: 'right', label: 'Pinned right' },
]

type ColumnChooserListProps<TData> = {
  api: GridApi<TData>
  columns: ChooserColumn[]
  search: string
}

const ColumnChooserList = <TData,>({
  api,
  columns,
  search,
}: ColumnChooserListProps<TData>) => {
  const { classes } = useColumnChooserStyles()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const query = search.trim().toLowerCase()
  const groups = groupColumns(columns)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    const order = moveColumn({
      columns,
      activeColId: String(active.id),
      overColId: String(over.id),
    })
    if (order)
      api.applyColumnState({
        state: order.map((colId) => ({ colId })),
        applyOrder: true,
      })
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      <div className={classes.groups}>
        {groupLabels.map(({ group, label }) => {
          const items = groups[group].filter(({ headerName }) =>
            headerName.toLowerCase().includes(query)
          )
          if (!items.length) return null
          return (
            <section key={group} aria-label={label}>
              <Typography className={classes.subheader} variant="overline">
                {label}
              </Typography>
              <SortableContext
                items={items.map(({ colId }) => colId)}
                strategy={verticalListSortingStrategy}
              >
                <ul className={classes.list}>
                  {items.map((column) => (
                    <ColumnChooserRow
                      key={column.colId}
                      column={column}
                      isDragDisabled={!!query}
                      onToggle={(visible) =>
                        api.setColumnsVisible([column.colId], visible)
                      }
                    />
                  ))}
                </ul>
              </SortableContext>
            </section>
          )
        })}
      </div>
    </DndContext>
  )
}

export default ColumnChooserList
