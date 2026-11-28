import { type FC, useId, useRef, useState } from 'react'
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'

import { Button, IconButton, Popover, Tooltip } from '@mui/material'
import { SearchField } from 'components/inputs'
import TreeView from 'components/TreeView'
import { useTagsVocabulary, useTimeline } from 'hooks'
import type {
  FilterField,
  FilterOption,
  FilterRequest,
  ItemsFilter,
  ListFilterField,
} from 'types/itemsFilter'
import type { TagTarget } from 'types/tags'
import {
  emptyItemsFilter,
  getActiveFields,
  getFieldLabel,
} from 'utils/itemsFilter'

import FilterChip from './FilterChip'
import FilterDrawer from './FilterDrawer'
import FilterFieldEditor from './FilterFieldEditor'
import useItemsFilterBarStyles from './ItemsFilterBar.styles'

export type ItemsFilterBarProps = {
  fields: FilterField[]
  filter: ItemsFilter
  itemType?: TagTarget
  mapFieldsToOptions: Partial<Record<ListFilterField, FilterOption[]>>
  onChange: (filter: ItemsFilter) => void
  request?: FilterRequest
}

type Editing = {
  field: FilterField
  hasChip: boolean
  left: number
  top: number
}

const getEditing = ({
  anchorElement,
  field,
  hasChip,
}: {
  anchorElement: Element
  field: FilterField
  hasChip: boolean
}): Editing => {
  const { bottom, left } = anchorElement.getBoundingClientRect()
  return { field, hasChip, left, top: bottom + 4 }
}

const ItemsFilterBar: FC<ItemsFilterBarProps> = (props) => {
  const { fields, filter, onChange, request } = props
  const { classes } = useItemsFilterBarStyles()
  const drawerId = useId()
  const editorId = useId()
  const tagsVocabulary = useTagsVocabulary()
  const timeline = useTimeline()
  const editorRef = useRef<HTMLDivElement>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Editing>()
  const activeFields = getActiveFields({ fields, filter })
  const chipFields =
    editing?.hasChip && !activeFields.includes(editing.field)
      ? [...activeFields, editing.field]
      : activeFields

  const [handledRequest, setHandledRequest] = useState(request)

  if (request !== handledRequest) {
    setHandledRequest(request)
    if (request)
      setEditing(
        getEditing({
          anchorElement: request.anchorElement,
          field: request.field,
          hasChip: activeFields.includes(request.field),
        })
      )
  }

  const formatValue = (field: FilterField) => {
    const value = filter[field]
    if (value === null) return 'Any'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    const getLabel =
      field === 'tags'
        ? tagsVocabulary.getPathLabel
        : field === 'timeline'
          ? timeline.getPathLabel
          : (id: string) => id
    return value.map(getLabel).join(', ') || 'Any'
  }

  return (
    <div aria-label="Filter" className={classes.bar} role="search">
      <SearchField
        onChange={(search) => onChange({ ...filter, search })}
        value={filter.search}
      />
      <Button
        aria-controls={isDrawerOpen ? drawerId : undefined}
        aria-expanded={isDrawerOpen}
        className={classes.filtersButton}
        onClick={() => setIsDrawerOpen((isOpen) => !isOpen)}
        startIcon={<MdFilterAlt />}
        variant="outlined"
      >
        {activeFields.length ? `Filters (${activeFields.length})` : 'Filters'}
      </Button>
      {chipFields.map((field) => (
        <FilterChip
          key={field}
          category={getFieldLabel(field)}
          editorId={editorId}
          isEditing={editing?.field === field}
          isEnabled={!filter.disabledFields.includes(field)}
          onDelete={() =>
            onChange({ ...filter, [field]: emptyItemsFilter[field] })
          }
          onEdit={(anchorElement) =>
            setEditing(getEditing({ anchorElement, field, hasChip: true }))
          }
          onToggle={() =>
            onChange({
              ...filter,
              disabledFields: filter.disabledFields.includes(field)
                ? filter.disabledFields.filter((other) => other !== field)
                : [...filter.disabledFields, field],
            })
          }
          tooltip={
            field === 'tags' ? (
              <TreeView ids={filter.tags} tree={tagsVocabulary} />
            ) : field === 'timeline' ? (
              <TreeView ids={filter.timeline} tree={timeline} />
            ) : undefined
          }
          value={formatValue(field)}
        />
      ))}
      {activeFields.length > 0 && (
        <Tooltip title="Clear all filters">
          <IconButton
            aria-label="Clear all filters"
            onClick={() =>
              onChange({ ...emptyItemsFilter, search: filter.search })
            }
          >
            <MdFilterAltOff />
          </IconButton>
        </Tooltip>
      )}
      <Popover
        anchorPosition={editing}
        anchorReference="anchorPosition"
        onClose={() => setEditing(undefined)}
        open={!!editing}
        slotProps={{
          paper: { id: editorId, role: 'dialog' },
          transition: {
            onEntered: () =>
              editorRef.current
                ?.querySelector<HTMLElement>('input, button')
                ?.focus(),
          },
        }}
      >
        {editing && (
          <div ref={editorRef} className={classes.editor}>
            <FilterFieldEditor
              {...props}
              field={editing.field}
              id={`${editorId}-${editing.field}`}
            />
          </div>
        )}
      </Popover>
      <FilterDrawer
        {...props}
        id={drawerId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

export default ItemsFilterBar
