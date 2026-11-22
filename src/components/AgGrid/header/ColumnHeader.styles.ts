import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'ColumnHeader' })((theme) => ({
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(0.5),
    minWidth: 0,
    width: '100%',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&[data-sortable]': {
      cursor: 'pointer',
    },
  },
  sort: {
    alignItems: 'center',
    color: theme.palette.text.secondary,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: theme.typography.pxToRem(12),
  },
  adornment: {
    fontSize: 14,
    padding: 6,
  },
  menuButton: {
    flexShrink: 0,
    fontSize: 16,
    marginLeft: 'auto',
    padding: 4,
  },
}))
