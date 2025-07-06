import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gridGap: theme.spacing(1),
  },
  dialogContent: {
    display: 'grid',
    gridGap: theme.spacing(2),
    overflow: 'visible',
  },
  minifigElement: {
    backgroundColor: theme.palette.grey['700'],
    borderRadius: theme.shape.borderRadius,
    display: 'grid',
    gap: theme.spacing(1),
    gridTemplateColumns: '1fr 1fr',
    justifyItems: 'center',
    padding: theme.spacing(1),
  },
  span1: {
    gridColumn: 'span 1',
  },
  span2: {
    gridColumn: 'span 2',
  },
}))

export default useStyles
