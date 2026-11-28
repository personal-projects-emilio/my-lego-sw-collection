import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'ItemsFilterBar' })((theme) => ({
  bar: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  filtersButton: { flexShrink: 0, height: 40 },
  editor: { padding: theme.spacing(2), width: 360 },
}))
