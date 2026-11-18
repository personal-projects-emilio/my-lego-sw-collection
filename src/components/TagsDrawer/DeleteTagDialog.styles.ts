import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'DeleteTagDialog' })((theme) => ({
  dialog: {
    zIndex: theme.zIndex.modal + 1,
  },
  picker: {
    zIndex: theme.zIndex.modal + 2,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  items: {
    margin: 0,
    paddingLeft: theme.spacing(2.5),
  },
}))
