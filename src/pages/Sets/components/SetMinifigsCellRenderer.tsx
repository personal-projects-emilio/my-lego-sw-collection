import {
  Avatar,
  Checkbox,
  FormControlLabel,
  Paper,
  Tooltip,
} from '@mui/material'
import type { CustomCellRendererProps } from 'ag-grid-react'
import OverflowTypography from 'components/OverflowTypography'
import { mapItemToImageProps } from 'constants/common'
import { makeStyles } from 'tss-react/mui'
import type { Set } from 'types/sets'

const useStyles = makeStyles<{ numberOfColumns: number }>({
  name: 'SetMinifigsCellRenderer',
})((theme, { numberOfColumns }) => ({
  avatar: {
    backgroundColor: theme.palette.primary.dark,
    fontSize: theme.typography.button.fontSize,
    height: 24,
    width: 24,
  },
  characterName: {
    justifySelf: 'normal',
    textAlign: 'center',
  },
  paper: {
    '& img': {
      maxHeight: '200px',
      maxWidth: '100%',
      paddingBottom: theme.spacing(1),
    },
    display: 'grid',
    gridTemplateRows: '1fr auto auto auto',
    justifyItems: 'center',
    maxWidth: '150px',
    padding: theme.spacing(1),
  },
  tooltip: {
    display: 'grid',
    gap: theme.spacing(1),
    gridTemplateColumns: `repeat(${numberOfColumns}, 1fr)`,
    maxHeight: '640px',
    maxWidth: 'unset',
    overflowX: 'auto',
  },
}))

const SetMinifigsCellRenderer = ({
  value: setMinifigs,
}: CustomCellRendererProps<Set, Set['content']['minifigs']>) => {
  const numberOfMinifigs = setMinifigs?.length ?? 0
  const { classes } = useStyles({
    numberOfColumns: Math.min(
      numberOfMinifigs,
      numberOfMinifigs < 7 && numberOfMinifigs > 4 ? 3 : 4
    ),
  })
  if (!setMinifigs || numberOfMinifigs === 0) return null

  return (
    <Tooltip
      classes={{
        tooltip: classes.tooltip,
      }}
      enterDelay={500}
      enterNextDelay={500}
      title={setMinifigs.map(({ characterName, id, isInFrame, quantity }) => (
        <Paper
          className={classes.paper}
          key={`setMinifigs-${id}-${characterName}`}
        >
          <img {...mapItemToImageProps.minifig(id)} />
          <OverflowTypography>{`${id} (x${quantity})`}</OverflowTypography>
          <OverflowTypography className={classes.characterName}>
            {characterName}
          </OverflowTypography>
          <FormControlLabel
            control={<Checkbox disabled checked={isInFrame} />}
            label="In frame"
          />
        </Paper>
      ))}
    >
      <Avatar className={classes.avatar}>
        {setMinifigs.reduce((total, minifig) => total + minifig.quantity, 0)}
      </Avatar>
    </Tooltip>
  )
}

export default SetMinifigsCellRenderer
