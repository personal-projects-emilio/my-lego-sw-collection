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

import FieldEditor from './FieldEditor'
import {
  emptySetsFilter,
  filterCategories,
  type FilterVariantProps,
  getActiveFields,
  type SetsFilterField,
  setsFilterFields,
} from './setsFilter'

type FilterDrawerProps = FilterVariantProps & {
  excludedFields?: SetsFilterField[]
  isOpen: boolean
  onClose: () => void
  panelId: string
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
  excludedFields = [],
  isOpen,
  onClose,
  panelId,
  ...props
}) => {
  const { filter, onChange } = props
  const { classes } = useFilterDrawerStyles()
  const hasActiveFields = getActiveFields(filter).some(
    (field) => !excludedFields.includes(field)
  )

  return (
    <SideDrawer
      actions={
        <Button
          disabled={!hasActiveFields}
          onClick={() =>
            onChange({
              ...emptySetsFilter,
              ...Object.fromEntries(
                excludedFields.map((field) => [field, filter[field]])
              ),
            })
          }
          size="small"
        >
          Clear all
        </Button>
      }
      defaultWidth={360}
      id={panelId}
      isOpen={isOpen}
      minWidth={280}
      onClose={onClose}
      storageKey="filtersDrawerWidth"
      title="Filters"
    >
      <div className={classes.body}>
        {filterCategories.map(({ category, title }) => (
          <Accordion
            key={title}
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
              {setsFilterFields
                .filter(
                  (definition) =>
                    definition.category === category &&
                    !excludedFields.includes(definition.field)
                )
                .map(({ field, label }) => (
                  <FieldEditor
                    key={field}
                    {...props}
                    field={field}
                    id={`${panelId}-${field}`}
                    label={label}
                  />
                ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </SideDrawer>
  )
}

export default FilterDrawer
