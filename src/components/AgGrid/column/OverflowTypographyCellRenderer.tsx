import { type CustomCellRendererProps } from 'ag-grid-react'
import OverflowTypography from 'components/OverflowTypography'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  typography: {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
  },
}))

const OverflowTypographyCellRenderer = ({
  value,
  valueFormatted,
}: CustomCellRendererProps) => {
  const { classes } = useStyles()
  if (!value) return null

  return (
    <OverflowTypography className={classes.typography} variant="body2">
      {valueFormatted ?? value}
    </OverflowTypography>
  )
}

export default OverflowTypographyCellRenderer
