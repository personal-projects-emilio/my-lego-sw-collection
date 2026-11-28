import { makeStyles } from 'tss-react/mui'

import { indent } from './tagTree'

export default makeStyles<void, 'addButton'>({
  name: 'TagsDrawer',
})((theme, _params, classes) => ({
  alert: {
    margin: theme.spacing(0, 2, 1),
  },
  list: {
    flex: 1,
    listStyle: 'none',
    margin: 0,
    overflowY: 'auto',
    padding: theme.spacing(0, 1, 2),
  },
  row: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    gap: theme.spacing(0.5),
    minHeight: 36,
    paddingLeft: `calc(var(--depth) * ${indent}px)`,
    [`&:hover .${classes.addButton}, &:focus-within .${classes.addButton}`]: {
      opacity: 1,
    },
    '&[data-dragging]': {
      boxShadow: theme.shadows[4],
      outline: `1px solid ${theme.palette.primary.main}`,
      position: 'relative',
      zIndex: 1,
    },
    '&[data-drop-target]': {
      backgroundColor: theme.alpha(
        theme.palette.primary.main,
        theme.palette.action.selectedOpacity
      ),
      outline: `1px dashed ${theme.palette.primary.main}`,
    },
  },
  addButton: {
    opacity: 0,
    '@media (hover: none)': {
      opacity: 1,
    },
  },
  actions: {
    display: 'flex',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  handleSpacer: {
    flexShrink: 0,
    width: 28,
  },
  dropNote: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    maxWidth: '60%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&[data-refused]': {
      color: theme.palette.error.main,
    },
  },
  footer: {
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
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
  },
  toggleSpacer: {
    flexShrink: 0,
    width: 28,
  },
  label: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  name: {
    flex: '0 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&[data-root]': {
      fontWeight: 700,
      textTransform: 'uppercase',
    },
  },
  details: {
    flex: '1 1 0',
    minWidth: 0,
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  input: {
    flex: 1,
  },
}))
