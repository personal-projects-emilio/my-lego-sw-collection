import type { FC } from 'react'
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
import { useAuth } from 'providers'
import { makeStyles } from 'tss-react/mui'
import { isNotNullOrUndefined } from 'utils/typescript'

import SyncMinifigsButton from './SyncMinifigsButton'

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
    gridTemplateColumns: '1fr max-content',
    justifyItems: 'baseline',
    padding: theme.spacing(1),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
  },
  authenticatedHeader: {
    gridTemplateColumns: '1fr repeat(3,max-content)',
  },
}))

const ModuleHeader: FC<ModuleHeaderProps> = ({
  setQuickFilter,
  addTo,
  statisticsTooltipTitle,
}) => {
  const { classes, cx } = useStyles()
  const { idToken } = useAuth()
  return (
    <header
      className={cx(classes.header, {
        [classes.authenticatedHeader]: isNotNullOrUndefined(idToken),
      })}
    >
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
      <DisplayIfAuthenticated>
        <Tooltip title={statisticsTooltipTitle}>
          <Avatar>
            <MdBarChart />
          </Avatar>
        </Tooltip>
        <SyncMinifigsButton />
      </DisplayIfAuthenticated>
      <Button size="small" component={Link} to={addTo} variant="contained">
        Add
      </Button>
    </header>
  )
}

export default ModuleHeader
