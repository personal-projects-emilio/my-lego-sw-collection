import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'SideDrawer' })((theme) => ({
  drawer: {
    zIndex: theme.zIndex.modal,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100vw',
    outline: 'none',
  },
  docked: {
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    maxWidth: '50vw',
    minHeight: 0,
    position: 'relative',
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
}))
