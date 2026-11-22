import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'ColumnChooser' })((theme) => ({
  panel: {
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    maxWidth: '50vw',
    minHeight: 0,
    position: 'relative',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100vw',
  },
  resizeHandle: {
    bottom: 0,
    cursor: 'col-resize',
    left: 0,
    position: 'absolute',
    top: 0,
    touchAction: 'none',
    width: 6,
    zIndex: 1,
    '&:hover, &:focus-visible, &:active': {
      backgroundColor: theme.palette.primary.main,
      outline: 'none',
    },
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1, 1, 2),
  },
  title: {
    flex: 1,
  },
  alert: {
    margin: theme.spacing(0, 2, 1),
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0, 2, 1),
  },
  groups: {
    flex: 1,
    minHeight: 0,
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
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    gap: theme.spacing(0.5),
    minHeight: 36,
    '&[data-dragging]': {
      boxShadow: theme.shadows[4],
      outline: `1px solid ${theme.palette.primary.main}`,
      position: 'relative',
      zIndex: 1,
    },
  },
  handle: {
    alignItems: 'center',
    borderRadius: '50%',
    color: theme.palette.action.active,
    cursor: 'grab',
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: theme.typography.pxToRem(18),
    padding: 5,
    touchAction: 'none',
    '&:hover': {
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
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
  },
  tab: {
    alignSelf: 'flex-start',
    borderRadius: 0,
    flexShrink: 0,
    minWidth: 0,
    padding: theme.spacing(1, 0.5),
    writingMode: 'vertical-rl',
    '& .MuiButton-startIcon': {
      margin: theme.spacing(0, 0, 1, 0),
    },
  },
}))
