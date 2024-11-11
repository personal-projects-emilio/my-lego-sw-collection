import { makeStyles } from 'tss-react/mui'

const useAgGridStyles = makeStyles()((theme) => ({
  flexAlignCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  gap1: {
    gap: theme.spacing(1),
  },
}))

export default useAgGridStyles
