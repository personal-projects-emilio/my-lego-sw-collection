import type { FC } from 'react'
import { MdFilterAlt } from 'react-icons/md'

import { Badge, Button, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import FilterDrawer from './FilterDrawer'
import {
  type FilterVariantProps,
  formatFieldValue,
  getActiveFields,
  getFieldLabel,
} from './setsFilter'
import useFilterDrawer from './useFilterDrawer'

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
  })
)

const SidePanelVariant: FC<FilterVariantProps> = (props) => {
  const { classes } = useSidePanelStyles()
  const drawer = useFilterDrawer(props.request)
  const activeFields = getActiveFields(props.filter)

  return (
    <div className={classes.bar}>
      <Badge badgeContent={activeFields.length} color="primary">
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
      <FilterDrawer
        {...props}
        isOpen={drawer.isOpen}
        onClose={drawer.onClose}
        panelId={drawer.panelId}
      />
    </div>
  )
}

export default SidePanelVariant
