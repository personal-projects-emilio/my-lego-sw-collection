import type { FC, PropsWithChildren } from 'react'
import { MdBarChart } from 'react-icons/md'

import { Button, Tooltip, type TooltipProps } from '@mui/material'
import { Link, type LinkProps } from '@tanstack/react-router'
import Avatar from 'components/Avatar'
import DisplayIfAuthenticated from 'components/DisplayIfAuthenticated'
import { SearchField } from 'components/inputs'
import { makeStyles } from 'tss-react/mui'

import ImportBricksetCsv from './ImportBricksetCsv'

type ModuleHeaderProps = {
  addTo: NonNullable<LinkProps['to']>
  quickFilter: string
  setQuickFilter: (value: string) => void
  statisticsTooltipTitle: NonNullable<TooltipProps['title']>
}

const useModuleHeaderStyles = makeStyles({ name: 'ModuleHeader' })((theme) => ({
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
  quickFilter,
  setQuickFilter,
  addTo,
  statisticsTooltipTitle,
}) => {
  const { classes } = useModuleHeaderStyles()
  return (
    <header className={classes.header}>
      <SearchField value={quickFilter} onChange={setQuickFilter} />
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
