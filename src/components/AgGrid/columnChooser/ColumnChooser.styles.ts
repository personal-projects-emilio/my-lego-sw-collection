import { makeStyles } from 'tss-react/mui'

import { gridColors } from '../table/gridColors'

export default makeStyles({ name: 'ColumnChooser' })((theme) => {
  const fullRow = { gridColumn: '1 / -1' }
  return {
    chooser: {
      display: 'grid',
      flex: 1,
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
      minHeight: 0,
    },
    alert: {
      ...fullRow,
      gridRow: 1,
      margin: theme.spacing(0, 2, 1),
    },
    showAll: {
      alignSelf: 'center',
      gridRow: 2,
      margin: theme.spacing(1, 0.5, 1, 1),
    },
    search: {
      gridRow: 2,
      padding: theme.spacing(1, 2, 1, 0),
      '& .MuiTextField-root': {
        width: '100%',
      },
    },
    groups: {
      ...fullRow,
      borderTop: `1px solid ${theme.palette.divider}`,
      gridRow: 3,
      overflowY: 'auto',
      padding: theme.spacing(0, 1, 1),
    },
    subheader: {
      color: theme.palette.text.secondary,
      display: 'block',
      padding: theme.spacing(1, 1, 0.5),
    },
    list: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    row: {
      alignItems: 'center',
      borderRadius: theme.shape.borderRadius,
      display: 'flex',
      gap: theme.spacing(0.5),
      minHeight: 36,
      '&[data-dragging]': {
        backgroundColor: gridColors.chrome,
        boxShadow: theme.shadows[4],
        outline: `1px solid ${theme.palette.primary.main}`,
        position: 'relative',
        zIndex: 1,
      },
    },
    handle: {
      borderRadius: '50%',
      boxSizing: 'content-box',
      color: theme.palette.action.active,
      cursor: 'grab',
      display: 'inline-flex',
      flexShrink: 0,
      fontSize: theme.typography.pxToRem(18),
      padding: 5,
      touchAction: 'none',
      '&:hover:not([data-disabled])': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
      },
      '&[data-disabled]': {
        cursor: 'default',
        opacity: theme.palette.action.disabledOpacity,
      },
    },
    checkboxLabel: {
      flex: 1,
      marginRight: 0,
      minWidth: 0,
      '& .MuiFormControlLabel-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },
    footer: {
      ...fullRow,
      borderTop: `1px solid ${theme.palette.divider}`,
      gridRow: 4,
      padding: theme.spacing(1, 2),
    },
  }
})
