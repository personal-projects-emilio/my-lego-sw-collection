import { makeStyles } from 'tss-react/mui'

export default makeStyles({
  name: 'AddLooseMinifigFormModal',
})((theme) => ({
  container: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
}))
