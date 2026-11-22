import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
  useState,
} from 'react'
import { MdChevronRight } from 'react-icons/md'

import { Menu as MuiMenu, MenuItem } from '@mui/material'

import useMenuStyles from './Menu.styles'
import type { SubmenuItem } from './menu.types'
import { type InjectedMenuItemProps, MenuItemContent } from './MenuItems'
import { renderMenuItems } from './renderMenuItems'

type NestedMenuItemProps = InjectedMenuItemProps & {
  item: SubmenuItem
  onClose: () => void
}

const isInside = ({
  element,
  target,
}: {
  element: HTMLElement | null
  target: EventTarget | null
}) => target instanceof Node && !!element?.contains(target)

const NestedMenuItem: FC<NestedMenuItemProps> = ({
  item,
  onClose,
  ...menuItemProps
}) => {
  const { classes } = useMenuStyles()
  const [itemElement, setItemElement] = useState<HTMLLIElement | null>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const [openedBy, setOpenedBy] = useState<'pointer' | 'keyboard'>()
  const isOpen = !!openedBy && !item.disabled && !!itemElement
  const byKeyboard = openedBy === 'keyboard'

  const closeSubmenu = () => {
    setOpenedBy(undefined)
    itemElement?.focus()
  }

  return (
    <>
      <MenuItem
        {...menuItemProps}
        ref={setItemElement}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={item.disabled}
        onClick={(event) =>
          setOpenedBy(event.detail === 0 ? 'keyboard' : 'pointer')
        }
        onKeyDown={(event) => {
          if (event.key !== 'ArrowRight') return
          event.preventDefault()
          event.stopPropagation()
          setOpenedBy('keyboard')
        }}
        onMouseEnter={() => setOpenedBy('pointer')}
        onMouseLeave={(event) => {
          if (
            !isInside({
              element: paperRef.current,
              target: event.relatedTarget,
            })
          )
            setOpenedBy(undefined)
        }}
      >
        <MenuItemContent
          end={
            <>
              {item.shortcut}
              <MdChevronRight aria-hidden />
            </>
          }
          icon={item.icon}
          label={item.label}
        />
      </MenuItem>
      <MuiMenu
        anchorEl={itemElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        autoFocus={byKeyboard}
        className={classes.submenu}
        disableAutoFocus={!byKeyboard}
        disableEnforceFocus
        disableRestoreFocus
        hideBackdrop
        onClose={closeSubmenu}
        open={isOpen}
        slotProps={{
          list: {
            'aria-label': item.label,
            onKeyDown: (event: KeyboardEvent<HTMLUListElement>) => {
              if (event.key !== 'ArrowLeft') return
              event.preventDefault()
              event.stopPropagation()
              closeSubmenu()
            },
          },
          paper: {
            ref: paperRef,
            className: classes.submenuPaper,
            onMouseLeave: (event: MouseEvent<HTMLDivElement>) => {
              if (
                !isInside({ element: itemElement, target: event.relatedTarget })
              )
                setOpenedBy(undefined)
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        {renderMenuItems({ items: item.items, onClose })}
      </MuiMenu>
    </>
  )
}

export default NestedMenuItem
