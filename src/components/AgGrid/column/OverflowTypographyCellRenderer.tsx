import type { CustomCellRendererProps } from 'ag-grid-react'
import OverflowTypography from 'components/OverflowTypography'
import { makeStyles } from 'tss-react/mui'
import { isNotNullOrUndefined } from 'utils/typescript'

const useStyles = makeStyles({ name: 'OverflowTypographyCellRenderer' })(
  () => ({
    typography: {
      position: 'relative',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  })
)

const OverflowTypographyCellRenderer = ({
  value,
  valueFormatted,
}: CustomCellRendererProps) => {
  const { classes } = useStyles()
  if (!isNotNullOrUndefined(value) && !isNotNullOrUndefined(valueFormatted))
    return null

  return (
    <OverflowTypography className={classes.typography} variant="body2">
      {valueFormatted ?? value}
    </OverflowTypography>
  )
}

export default OverflowTypographyCellRenderer
