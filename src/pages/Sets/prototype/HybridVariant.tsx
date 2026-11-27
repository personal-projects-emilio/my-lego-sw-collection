import type { FC } from 'react'
import { MdFilterAlt } from 'react-icons/md'

import { Badge, Button, Chip } from '@mui/material'
import { SearchField } from 'components/inputs'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import { makeStyles } from 'tss-react/mui'

import FilterDrawer from './FilterDrawer'
import {
  emptySetsFilter,
  type FilterVariantProps,
  formatFieldValue,
  getActiveFields,
  getFieldLabel,
} from './setsFilter'
import useFilterDrawer from './useFilterDrawer'

type HybridVariantProps = FilterVariantProps & { layout: 'oneRow' | 'twoRows' }

const useHybridStyles = makeStyles({ name: 'HybridVariant' })((theme) => ({
  controls: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  chipRow: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
}))

const HybridVariant: FC<HybridVariantProps> = ({ layout, ...props }) => {
  const { filter, onChange } = props
  const { classes } = useHybridStyles()
  const drawer = useFilterDrawer(props.request)
  const chipFields = getActiveFields(filter).filter((field) => field !== 'search')

  const chips = chipFields.length > 0 && (
    <>
      {chipFields.map((field) => (
        <Chip
          key={field}
          aria-controls={drawer.panelId}
          aria-haspopup="dialog"
          color="primary"
          label={`${getFieldLabel(field)}: ${formatFieldValue({ ...props, field })}`}
          onClick={() => drawer.openField(field)}
          onDelete={() => onChange({ ...filter, [field]: emptySetsFilter[field] })}
          size="small"
        />
      ))}
      <Button
        onClick={() => onChange({ ...emptySetsFilter, search: filter.search })}
        size="small"
      >
        Clear all
      </Button>
    </>
  )

  return (
    <>
      <ModuleHeader addTo="/sets/add">
        <div className={classes.controls} role="search" aria-label="Filter sets">
          <SearchField
            value={filter.search}
            onChange={(search) => onChange({ ...filter, search })}
          />
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
          {layout === 'oneRow' && chips}
        </div>
      </ModuleHeader>
      {layout === 'twoRows' && chips && (
        <div className={classes.chipRow} aria-label="Active filters" role="group">
          {chips}
        </div>
      )}
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
