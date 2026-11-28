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
  getActiveFields,
} from 'utils/itemsFilter'

import FilterFieldEditor from './FilterFieldEditor'
import type { ItemsFilterBarProps } from './ItemsFilterBar'

type FilterDrawerProps = Omit<ItemsFilterBarProps, 'request'> & {
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
  field: { display: 'grid', gap: theme.spacing(0.5) },
}))

const FilterDrawer: FC<FilterDrawerProps> = ({
  fields,
  filter,
  id,
  isOpen,
  itemType,
  mapFieldsToOptions,
  onChange,
  onClose,
}) => {
  const { classes } = useFilterDrawerStyles()
  const hasActiveFields =
    getActiveFields({
      fields: filterFieldDefinitions.map(({ field }) => field),
      filter,
    }).length > 0

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
            (definition) => definition.category === category
          )
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
                  <div key={field} className={classes.field}>
                    <FilterFieldEditor
                      field={field}
                      filter={filter}
                      id={`${id}-${field}`}
                      itemType={itemType}
                      label={label}
                      onChange={onChange}
                      mapFieldsToOptions={mapFieldsToOptions}
                    />
                    {!fields.includes(field) && (
                      <Typography
                        color="text.secondary"
                        id={`${id}-${field}-not-applied`}
                        variant="caption"
                      >
                        Not applied on this page
                      </Typography>
                    )}
                  </div>
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
