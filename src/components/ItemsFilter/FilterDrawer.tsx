import type { FC } from 'react'
import { MdExpandMore, MdInfoOutline } from 'react-icons/md'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Tooltip,
  Typography,
} from '@mui/material'
import SideDrawer from 'components/SideDrawer'
import {
  emptyItemsFilter,
  filterCategories,
  filterFieldDefinitions,
  getActiveFields,
} from 'utils/itemsFilter'

import useFilterDrawerStyles from './FilterDrawer.styles'
import FilterFieldEditor from './FilterFieldEditor'
import type { ItemsFilterBarProps } from './ItemsFilterBar'

type FilterDrawerProps = Omit<ItemsFilterBarProps, 'request'> & {
  id: string
  isOpen: boolean
  onClose: () => void
}

const FilterDrawer: FC<FilterDrawerProps> = ({
  fields,
  filter,
  id,
  isOpen,
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
                  <FilterFieldEditor
                    key={field}
                    field={field}
                    filter={filter}
                    id={`${id}-${field}`}
                    label={
                      fields.includes(field) ? (
                        label
                      ) : (
                        <>
                          {label}
                          <Tooltip title="Not applied on this page">
                            <MdInfoOutline
                              aria-label="Not applied on this page"
                              className={classes.notApplied}
                              role="img"
                            />
                          </Tooltip>
                        </>
                      )
                    }
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
