import { type ComponentType, type FC, useRef, useState } from 'react'
import {
  MdArrowDownward,
  MdArrowUpward,
  MdFilterAlt,
  MdMoreVert,
} from 'react-icons/md'

import { IconButton } from '@mui/material'
import type { CustomHeaderProps } from 'ag-grid-react'
import { Menu, type MenuAnchor } from 'components/Menu'

import { useColumnLayoutActions } from '../table/columnLayoutContext'
import useColumnHeaderStyles from './ColumnHeader.styles'
import { getHeaderMenuItems } from './getHeaderMenuItems'
import useColumnSort from './useColumnSort'
import useHeaderMenuTriggers from './useHeaderMenuTriggers'

export type ColumnHeaderParams = {
  labelAdornment?: ComponentType<{ className?: string }>
}

const ColumnHeader: FC<CustomHeaderProps & ColumnHeaderParams> = ({
  api,
  column,
  displayName,
  eGridHeader,
  enableSorting,
  progressSort,
  setSort,
  labelAdornment: LabelAdornment,
}) => {
  const { classes } = useColumnHeaderStyles()
  const actions = useColumnLayoutActions()
  const columnId = column.getColId()
  const filterActions = actions?.filter
  const openFilter = filterActions?.isColumnFilterable(columnId)
    ? () =>
        filterActions.openColumnFilter({ anchorElement: eGridHeader, columnId })
    : undefined
  const isFiltered = !!filterActions?.isColumnFiltered(columnId)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [anchor, setAnchor] = useState<MenuAnchor>()
  const { direction, position } = useColumnSort({ api, column })
  useHeaderMenuTriggers({ eGridHeader, buttonRef, open: setAnchor })

  return (
    <>
      <div
        className={classes.header}
        data-sortable={enableSorting || undefined}
        onClick={(event) => {
          if (
            !enableSorting ||
            (event.target instanceof Element && event.target.closest('button'))
          )
            return
          progressSort(event.shiftKey)
        }}
      >
        <span className={classes.label}>{displayName}</span>
        {direction && (
          <span aria-hidden className={classes.sort}>
            {direction === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />}
            {position}
          </span>
        )}
        {LabelAdornment && <LabelAdornment className={classes.adornment} />}
        {isFiltered && openFilter && (
          <IconButton
            aria-label={`${displayName} is filtered, edit filter`}
            className={classes.menuButton}
            color="primary"
            onClick={openFilter}
            size="small"
          >
            <MdFilterAlt fontSize="inherit" />
          </IconButton>
        )}
        <IconButton
          ref={buttonRef}
          aria-expanded={!!anchor}
          aria-haspopup="menu"
          aria-label={`${displayName} column menu`}
          className={classes.menuButton}
          onClick={(event) => setAnchor(event.currentTarget)}
          size="small"
        >
          <MdMoreVert fontSize="inherit" />
        </IconButton>
      </div>
      {anchor && (
        <Menu
          anchor={anchor}
          items={getHeaderMenuItems({
            api,
            column,
            openFilter,
            setSort,
            ...actions,
          })}
          onClose={() => setAnchor(undefined)}
        />
      )}
    </>
  )
}

export default ColumnHeader
