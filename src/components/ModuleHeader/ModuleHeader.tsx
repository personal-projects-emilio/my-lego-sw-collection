import type { FC, PropsWithChildren } from 'react'

import { MdAdd } from 'react-icons/md'

import { IconButton, Tooltip } from '@mui/material'
import { Link, type LinkProps } from '@tanstack/react-router'
import DisplayIfAuthenticated from 'components/DisplayIfAuthenticated'
import { SearchField } from 'components/inputs'
import { makeStyles } from 'tss-react/mui'

import ImportBricksetCsv from './ImportBricksetCsv'

type ModuleHeaderProps = {
  addLabel: string
  addTo: NonNullable<LinkProps['to']>
  quickFilter?: string
  setQuickFilter?: (value: string) => void
}

const useModuleHeaderStyles = makeStyles({ name: 'ModuleHeader' })((theme) => ({
  header: {
    alignItems: 'start',
    display: 'grid',
    gap: theme.spacing(1),
    gridAutoColumns: 'max-content',
    gridAutoFlow: 'column',
    gridTemplateColumns: 'minmax(0, 1fr)',
    justifyItems: 'baseline',
    padding: theme.spacing(1.5, 1),
  },
}))

const ModuleHeader: FC<PropsWithChildren<ModuleHeaderProps>> = ({
  children,
  quickFilter,
  setQuickFilter,
  addLabel,
  addTo,
}) => {
  const { classes } = useModuleHeaderStyles()
  return (
    <header className={classes.header}>
      {quickFilter !== undefined && setQuickFilter && (
        <SearchField value={quickFilter} onChange={setQuickFilter} />
      )}
      {children}
      <DisplayIfAuthenticated>
        <ImportBricksetCsv />
      </DisplayIfAuthenticated>
      <Tooltip title={addLabel}>
        <IconButton
          aria-label={addLabel}
          color="primary"
          component={Link}
          to={addTo}
        >
          <MdAdd />
        </IconButton>
      </Tooltip>
    </header>
  )
}

export default ModuleHeader
