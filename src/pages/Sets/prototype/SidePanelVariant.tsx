import { type FC, useEffect, useId, useState } from 'react'
import { MdClose, MdFilterAlt } from 'react-icons/md'

import {
  Badge,
  Button,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import FieldEditor from './FieldEditor'
import {
  emptySetsFilter,
  type FilterVariantProps,
  formatFieldValue,
  getActiveFields,
  getFieldLabel,
  setsFilterFields,
} from './setsFilter'

const useSidePanelStyles = makeStyles({ name: 'SidePanelVariant' })(
  (theme) => ({
    bar: {
      alignItems: 'center',
      borderBottom: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      gap: theme.spacing(2),
      padding: theme.spacing(1),
    },
    summary: { color: theme.palette.text.secondary },
    drawerPaper: { height: 'calc(100% - 48px)', top: 48 },
    panel: {
      display: 'grid',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      width: 360,
    },
    panelHeader: { alignItems: 'center', display: 'flex' },
    title: { flex: 1 },
  })
)

const groups = [
  { title: 'Shared with other pages', isShared: true },
  { title: 'Sets only', isShared: false },
]

const SidePanelVariant: FC<FilterVariantProps> = (props) => {
  const { filter, onChange, request } = props
  const { classes } = useSidePanelStyles()
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!request) return
    setIsOpen(true)
    const timeout = setTimeout(
      () => document.getElementById(`${panelId}-${request.field}`)?.focus(),
      250
    )
    return () => clearTimeout(timeout)
  }, [panelId, request])

  const activeFields = getActiveFields(filter)

  return (
    <div className={classes.bar}>
      <Badge badgeContent={activeFields.length} color="primary">
        <Button
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          size="small"
          startIcon={<MdFilterAlt />}
          variant="outlined"
        >
          Filters
        </Button>
      </Badge>
      <Typography className={classes.summary} variant="body2">
        {activeFields.length
          ? activeFields
              .map(
                (field) =>
                  `${getFieldLabel(field)}: ${formatFieldValue({ ...props, field })}`
              )
              .join(' · ')
          : 'No filter'}
      </Typography>
      <Drawer
        anchor="right"
        onClose={() => setIsOpen(false)}
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
              disabled={!activeFields.length}
              onClick={() => onChange(emptySetsFilter)}
              size="small"
            >
              Clear all
            </Button>
            <IconButton aria-label="Close filters" onClick={() => setIsOpen(false)}>
              <MdClose />
            </IconButton>
          </div>
          {groups.map(({ title, isShared }) => (
            <section key={title} aria-label={title} className={classes.panel}>
              <Divider textAlign="left">{title}</Divider>
              {setsFilterFields
                .filter((definition) => definition.isShared === isShared)
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
    </div>
  )
}

export default SidePanelVariant
