import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'SetFormModal' })((theme) => ({
  container: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(12, 1fr)',
  },
  gridSpan3: {
    gridColumn: 'span 3',
  },
  gridSpan4: {
    gridColumn: 'span 4',
  },
  gridSpan6: {
    gridColumn: 'span 6',
  },
  gridSpan12: {
    gridColumn: 'span 12',
  },
}))
