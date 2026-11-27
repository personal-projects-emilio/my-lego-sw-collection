import type { FC } from 'react'
import { MdClose, MdExpandMore } from 'react-icons/md'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material'
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
  drawerPaper: { height: 'calc(100% - 48px)', overflow: 'hidden', top: 48 },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: 360,
  },
  panelHeader: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    padding: theme.spacing(1, 1, 1, 2),
  },
  body: { overflowX: 'hidden', overflowY: 'auto' },
  accordion: {
    background: 'transparent',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&::before': { display: 'none' },
  },
  group: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  title: { flex: 1 },
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
    <Drawer
      anchor="right"
      onClose={onClose}
      open={isOpen}
      slotProps={{ paper: { className: classes.drawerPaper } }}
      variant="persistent"
    >
      <section aria-label="Filters" className={classes.panel} id={panelId}>
        <div className={classes.panelHeader}>
          <Typography className={classes.title} component="h2" variant="h6">
            Filters
          </Typography>
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
          <IconButton aria-label="Close filters" onClick={onClose}>
            <MdClose />
          </IconButton>
        </div>
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
                  .map(({ categoryLabel, field }) => (
                    <FieldEditor
                      key={field}
                      {...props}
                      field={field}
                      id={`${panelId}-${field}`}
                      label={categoryLabel}
                    />
                  ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </section>
    </Drawer>
  )
}

export default FilterDrawer
