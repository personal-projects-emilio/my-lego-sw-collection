import { type FC, useEffect, useId, useRef, useState } from 'react'
import { MdFilterAlt } from 'react-icons/md'

import { Button, Popover } from '@mui/material'
import { SearchField } from 'components/inputs'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { makeStyles } from 'tss-react/mui'

import FieldEditor from './FieldEditor'
import FilterChip from './FilterChip'
import FilterDrawer from './FilterDrawer'
import {
  emptySetsFilter,
  type FilterVariantProps,
  formatFieldValue,
  getActiveFields,
  getFieldLabel,
  isFieldActive,
  type SetsFilterField,
} from './setsFilter'
import useFilterDrawer from './useFilterDrawer'

const useHybridStyles = makeStyles({ name: 'HybridVariant' })((theme) => ({
  controls: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  filterRow: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
  filtersButton: { height: 40 },
  editor: { padding: theme.spacing(2), width: 360 },
}))

type HybridVariantProps = FilterVariantProps & { layout: 'oneRow' | 'twoRows' }

type Editing = { field: SetsFilterField; top: number; left: number }

const getEditing = ({
  anchorElement,
  field,
}: {
  anchorElement: Element
  field: SetsFilterField
}): Editing => {
  const { bottom, left } = anchorElement.getBoundingClientRect()
  return { field, top: bottom + 4, left }
}

const HybridVariant: FC<HybridVariantProps> = ({ layout, ...props }) => {
  const { disabledFields, filter, onChange, onToggleField, request } = props
  const { classes } = useHybridStyles()
  const drawer = useFilterDrawer()
  const editorId = useId()
  const filtersButtonRef = useRef<HTMLButtonElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState<Editing>()
  const chipFields = getActiveFields(filter).filter(
    (field) => field !== 'search'
  )

  useEffect(() => {
    const anchorElement = request?.anchorElement ?? filtersButtonRef.current
    if (request && anchorElement)
      setEditing(getEditing({ anchorElement, field: request.field }))
  }, [request])

  const filterControls = (
    <>
      <Button
        ref={filtersButtonRef}
        aria-controls={drawer.panelId}
        aria-expanded={drawer.isOpen}
        className={classes.filtersButton}
        onClick={drawer.toggle}
        startIcon={<MdFilterAlt />}
        variant="outlined"
      >
        {chipFields.length ? `Filters (${chipFields.length})` : 'Filters'}
      </Button>
      {chipFields.map((field) => (
        <FilterChip
          key={field}
          category={getFieldLabel(field)}
          editorId={editorId}
          isEditing={editing?.field === field}
          isEnabled={!disabledFields.includes(field)}
          onDelete={() =>
            onChange({ ...filter, [field]: emptySetsFilter[field] })
          }
          onEdit={(anchorElement) =>
            setEditing(getEditing({ anchorElement, field }))
          }
          onToggle={() => onToggleField(field)}
          value={formatFieldValue({ ...props, field })}
        />
      ))}
      {chipFields.length > 0 && (
        <Button
          onClick={() =>
            onChange({ ...emptySetsFilter, search: filter.search })
          }
          size="small"
        >
          Clear all
        </Button>
      )}
    </>
  )

  return (
    <>
      <ModuleHeader addTo="/sets/add">
        <div
          className={classes.controls}
          role="search"
          aria-label="Filter sets"
        >
          <SearchField
            value={filter.search}
            onChange={(search) => onChange({ ...filter, search })}
          />
          {layout === 'oneRow' && filterControls}
        </div>
      </ModuleHeader>
      {layout === 'twoRows' && (
        <div className={classes.filterRow} role="group" aria-label="Filters">
          {filterControls}
        </div>
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
            <FieldEditor
              {...props}
              field={editing.field}
              id={`${editorId}-${editing.field}`}
              onChange={(next) => {
                onChange(next)
                if (
                  isFieldActive({ filter, field: editing.field }) &&
                  !isFieldActive({ filter: next, field: editing.field })
                )
                  setEditing(undefined)
              }}
            />
          </div>
        )}
      </Popover>
      <FilterDrawer
        {...props}
        excludedFields={['search']}
        isOpen={drawer.isOpen}
        onClose={drawer.onClose}
        panelId={drawer.panelId}
      />
    </>
  )
}

export default HybridVariant
