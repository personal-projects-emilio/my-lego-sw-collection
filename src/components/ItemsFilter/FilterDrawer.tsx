import type { FC } from 'react'
import { MdExpandMore } from 'react-icons/md'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from '@mui/material'
import SideDrawer from 'components/SideDrawer'
import { makeStyles } from 'tss-react/mui'
import {
  emptyItemsFilter,
  filterCategories,
  filterFieldDefinitions,
} from 'utils/itemsFilter'

import FilterFieldEditor from './FilterFieldEditor'
import type { ItemsFilterBarProps } from './ItemsFilterBar'

type FilterDrawerProps = Omit<ItemsFilterBarProps, 'request'> & {
  hasActiveFields: boolean
  id: string
  isOpen: boolean
  onClose: () => void
}

const useFilterDrawerStyles = makeStyles({ name: 'FilterDrawer' })((theme) => ({
  body: { overflowX: 'hidden', overflowY: 'auto' },
  accordion: {
    background: 'transparent',
    borderTop: `1px solid ${theme.palette.divider}`,
    '&::before': { display: 'none' },
  },
  group: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
}))

const FilterDrawer: FC<FilterDrawerProps> = ({
  fields,
  filter,
  hasActiveFields,
  id,
  isOpen,
  itemType,
  mapFieldsToOptions,
  onChange,
  onClose,
}) => {
  const { classes } = useFilterDrawerStyles()

  return (
    <SideDrawer
      actions={
        <Button
          disabled={!hasActiveFields}
          onClick={() =>
            onChange({ ...emptyItemsFilter, search: filter.search })
          }
          size="small"
        >
          Clear all
        </Button>
      }
      defaultWidth={360}
      id={id}
      isOpen={isOpen}
      minWidth={280}
      onClose={onClose}
      storageKey="filtersDrawerWidth"
      title="Filters"
    >
      <div className={classes.body}>
        {filterCategories.map(({ category, title }) => {
          const definitions = filterFieldDefinitions.filter(
            (definition) =>
              definition.category === category &&
              fields.includes(definition.field)
          )
          if (!definitions.length) return null
          return (
            <Accordion
              key={category}
              className={classes.accordion}
              defaultExpanded
              disableGutters
              elevation={0}
              square
            >
              <AccordionSummary expandIcon={<MdExpandMore />}>
                <Typography variant="subtitle2">{title}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.group}>
                {definitions.map(({ field, label }) => (
                  <FilterFieldEditor
                    key={field}
                    field={field}
                    filter={filter}
                    id={`${id}-${field}`}
                    itemType={itemType}
                    label={label}
                    onChange={onChange}
                    mapFieldsToOptions={mapFieldsToOptions}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
          )
        })}
      </div>
    </SideDrawer>
  )
}

export default FilterDrawer
