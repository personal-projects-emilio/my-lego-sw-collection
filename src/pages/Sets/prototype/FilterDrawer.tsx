import type { FC } from 'react'
import { MdClose } from 'react-icons/md'

import { Button, Divider, Drawer, IconButton, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import FieldEditor from './FieldEditor'
import {
  emptySetsFilter,
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
  drawerPaper: { height: 'calc(100% - 48px)', top: 48 },
  panel: {
    display: 'grid',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    width: 360,
  },
  panelHeader: { alignItems: 'center', display: 'flex' },
  title: { flex: 1 },
}))

const groups = [
  { title: 'Shared with other pages', isShared: true },
  { title: 'Sets only', isShared: false },
]

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
        {groups.map(({ title, isShared }) => (
          <section key={title} aria-label={title} className={classes.panel}>
            <Divider textAlign="left">{title}</Divider>
            {setsFilterFields
              .filter(
                (definition) =>
                  definition.isShared === isShared &&
                  !excludedFields.includes(definition.field)
              )
              .map(({ field }) => (
                <FieldEditor
                  key={field}
                  {...props}
                  field={field}
                  id={`${panelId}-${field}`}
                />
              ))}
          </section>
        ))}
      </section>
    </Drawer>
  )
}

export default FilterDrawer
