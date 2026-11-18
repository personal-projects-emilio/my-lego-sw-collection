import {
  type FC,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FaSearch } from 'react-icons/fa'
import { MdBarChart, MdClose } from 'react-icons/md'

import {
  Button,
  debounce,
  IconButton,
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
  hidden: { visibility: 'hidden' },
}))

const ModuleHeader: FC<PropsWithChildren<ModuleHeaderProps>> = ({
  children,
  setQuickFilter,
  addTo,
  statisticsTooltipTitle,
}) => {
  const { classes } = useModuleHeaderStyles()
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuickFilter = useMemo(
    () => debounce(setQuickFilter, 500),
    [setQuickFilter]
  )
  useEffect(() => () => debouncedQuickFilter.clear(), [debouncedQuickFilter])

  const clearSearch = () => {
    debouncedQuickFilter.clear()
    setSearch('')
    setQuickFilter('')
    inputRef.current?.focus()
  }

  return (
    <header className={classes.header}>
      <TextField
        inputRef={inputRef}
        label="Search"
        onChange={(event) => {
          setSearch(event.target.value)
          debouncedQuickFilter(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && search) clearSearch()
        }}
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                position="end"
                className={search ? undefined : classes.hidden}
              >
                <IconButton
                  aria-label="Clear search"
                  edge="end"
                  onClick={clearSearch}
                  size="small"
                >
                  <MdClose />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        value={search}
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
