import type { FC, PropsWithChildren } from 'react'
import { FaSearch } from 'react-icons/fa'
import { MdBarChart } from 'react-icons/md'

import {
  Button,
  debounce,
  InputAdornment,
  TextField,
  Tooltip,
  type TooltipProps,
} from '@mui/material'
import { Link, type LinkProps } from '@tanstack/react-router'
import Avatar from 'components/Avatar'
import DisplayIfAuthenticated from 'components/DisplayIfAuthenticated'
import { makeStyles } from 'tss-react/mui'

import ImportBricksetCsv from './ImportBricksetCsv'

type ModuleHeaderProps = {
  addTo: NonNullable<LinkProps['to']>
  setQuickFilter: (value: string) => void
  statisticsTooltipTitle: NonNullable<TooltipProps['title']>
}

const useStyles = makeStyles({ name: 'ModuleHeader' })((theme) => ({
  header: {
    alignItems: 'center',
    display: 'grid',
    gap: theme.spacing(1),
    gridAutoColumns: 'max-content',
    gridAutoFlow: 'column',
    gridTemplateColumns: '1fr',
    justifyItems: 'baseline',
    padding: theme.spacing(1),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
  },
}))

const ModuleHeader: FC<PropsWithChildren<ModuleHeaderProps>> = ({
  children,
  setQuickFilter,
  addTo,
  statisticsTooltipTitle,
}) => {
  const { classes } = useStyles()

  return (
    <header className={classes.header}>
      <TextField
        label="Search"
        onChange={debounce((e) => setQuickFilter(e.target.value), 500)}
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch />
              </InputAdornment>
            ),
          },
        }}
        variant="outlined"
      />
      {children}
      <DisplayIfAuthenticated>
        <Tooltip title={statisticsTooltipTitle}>
          <Avatar>
            <MdBarChart />
          </Avatar>
        </Tooltip>
        <ImportBricksetCsv />
      </DisplayIfAuthenticated>
      <Button size="small" component={Link} to={addTo} variant="contained">
        Add
      </Button>
    </header>
  )
}

export default ModuleHeader
