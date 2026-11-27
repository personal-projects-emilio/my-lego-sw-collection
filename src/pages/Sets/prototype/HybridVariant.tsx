import { type FC, useId, useRef, useState } from 'react'
import { MdFilterAlt } from 'react-icons/md'

import { Badge, Button, Chip, Popover, Tooltip } from '@mui/material'
import { SearchField } from 'components/inputs'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { makeStyles } from 'tss-react/mui'

import FieldEditor from './FieldEditor'
import FilterDrawer from './FilterDrawer'
import {
  emptySetsFilter,
  type FilterVariantProps,
  formatFieldValue,
  getActiveFields,
  getFieldLabel,
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
  chip: { maxWidth: 220 },
  editor: { padding: theme.spacing(2), width: 360 },
}))

type HybridVariantProps = FilterVariantProps & { layout: 'oneRow' | 'twoRows' }

const HybridVariant: FC<HybridVariantProps> = ({ layout, ...props }) => {
  const { filter, onChange } = props
  const { classes } = useHybridStyles()
  const drawer = useFilterDrawer(props.request)
  const editorId = useId()
  const chipRefs = useRef<Partial<Record<SetsFilterField, HTMLDivElement>>>({})
  const [openField, setOpenField] = useState<SetsFilterField>()
  const chipFields = getActiveFields(filter).filter(
    (field) => field !== 'search'
  )

  const filterControls = (
    <>
      <Badge badgeContent={chipFields.length} color="primary">
        <Button
          aria-controls={drawer.panelId}
          aria-expanded={drawer.isOpen}
          onClick={drawer.toggle}
          size="small"
          startIcon={<MdFilterAlt />}
          variant="outlined"
        >
          Filters
        </Button>
      </Badge>
      {chipFields.map((field) => {
        const label = `${getFieldLabel(field)}: ${formatFieldValue({ ...props, field })}`
        return (
          <Tooltip key={field} title={label}>
            <Chip
              ref={(element) => {
                if (element) chipRefs.current[field] = element
              }}
              aria-controls={openField === field ? editorId : undefined}
              aria-expanded={openField === field}
              aria-haspopup="dialog"
              className={classes.chip}
              color="primary"
              label={label}
              onClick={() => setOpenField(field)}
              onDelete={() =>
                onChange({ ...filter, [field]: emptySetsFilter[field] })
              }
              size="small"
            />
          </Tooltip>
        )
      })}
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
        anchorEl={openField ? chipRefs.current[openField] : null}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={() => setOpenField(undefined)}
        open={!!openField}
        slotProps={{ paper: { id: editorId, role: 'dialog' } }}
      >
        {openField && (
          <div className={classes.editor}>
            <FieldEditor
              {...props}
              autoFocus
              field={openField}
              id={`${editorId}-${openField}`}
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
