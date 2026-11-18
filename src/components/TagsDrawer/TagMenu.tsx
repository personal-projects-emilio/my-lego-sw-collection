import type { FC } from 'react'
import { MdAdd, MdDelete, MdTextFields } from 'react-icons/md'

import { Divider, ListItemIcon, Menu, MenuItem } from '@mui/material'
import type { Tag } from 'types/tags'
import { editTag, isProtectedTag, type TagsState } from 'utils/tags'

import TagMenuSwitch from './TagMenuSwitch'
import useTagsDrawerStyles from './TagsDrawer.styles'
import { appliesToTarget, type Run, targets, toggledAppliesTo } from './tagTree'

type TagMenuProps = {
  anchor?: HTMLElement
  tag?: Tag
  state?: TagsState
  isPending: boolean
  run: Run
  onClose: () => void
  onRename: (tag: Tag) => void
  onAdd: (tag: Tag) => void
  onDelete: (tag: Tag) => void
}

const TagMenu: FC<TagMenuProps> = ({
  anchor,
  tag,
  state,
  isPending,
  run,
  onClose,
  onRename,
  onAdd,
  onDelete,
}) => {
  const { classes } = useTagsDrawerStyles()
  const close = (action: (tag: Tag) => void) => (picked: Tag) => {
    onClose()
    action(picked)
  }
  return (
    <Menu
      anchorEl={anchor}
      className={classes.menu}
      disableEnforceFocus
      disableRestoreFocus
      onClose={onClose}
      open={!!anchor}
    >
      {tag && [
        <MenuItem
          key="rename"
          disabled={isPending}
          onClick={() => close(onRename)(tag)}
        >
          <ListItemIcon>
            <MdTextFields aria-hidden />
          </ListItemIcon>
          Rename
        </MenuItem>,
        <MenuItem
          key="add"
          disabled={isPending}
          onClick={() => close(onAdd)(tag)}
        >
          <ListItemIcon>
            <MdAdd aria-hidden />
          </ListItemIcon>
          Add a tag inside
        </MenuItem>,
        ...(tag.parent
          ? []
          : [
              <Divider key="settings" />,
              ...targets.map((target) => {
                const checked = appliesToTarget({
                  appliesTo: tag.appliesTo,
                  target,
                })
                return (
                  <TagMenuSwitch
                    key={`applies-${target}`}
                    checked={checked}
                    disabled={
                      isPending || (checked && tag.appliesTo !== 'both')
                    }
                    label={`Applies to ${target}`}
                    onClick={() =>
                      run(
                        state &&
                          editTag({
                            state,
                            id: tag.id,
                            changes: {
                              appliesTo: toggledAppliesTo({
                                appliesTo: tag.appliesTo,
                                target,
                              }),
                            },
                          }),
                        `${checked ? 'Stopped' : 'Started'} applying ${tag.label} to ${target}`
                      )
                    }
                  />
                )
              }),
              <TagMenuSwitch
                key="inherited"
                checked={!!tag.inherited}
                disabled={isPending}
                label="Minifigs inherit it from their sets"
                onClick={() =>
                  run(
                    state &&
                      editTag({
                        state,
                        id: tag.id,
                        changes: { inherited: !tag.inherited },
                      }),
                    `Turned ${tag.inherited ? 'off' : 'on'} inheritance of ${tag.label}`
                  )
                }
              />,
            ]),
        <Divider key="danger" />,
        <MenuItem
          key="delete"
          disabled={isPending || isProtectedTag(tag.id)}
          onClick={() => close(onDelete)(tag)}
        >
          <ListItemIcon>
            <MdDelete aria-hidden />
          </ListItemIcon>
          Delete
        </MenuItem>,
      ]}
    </Menu>
  )
}

export default TagMenu
