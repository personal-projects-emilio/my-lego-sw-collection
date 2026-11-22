import type { FC } from 'react'
import { MdAdd, MdDelete, MdTextFields } from 'react-icons/md'

import { Menu, type MenuItemDefinition } from 'components/Menu'
import type { Tag } from 'types/tags'
import { editTag, isProtectedTag, type TagsState } from 'utils/tags'

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

const rootTagSettingsItems = ({
  tag,
  state,
  isPending,
  run,
}: Pick<TagMenuProps, 'state' | 'isPending' | 'run'> & {
  tag: Tag
}): MenuItemDefinition[] => [
  { kind: 'divider', key: 'settings' },
  ...targets.map((target): MenuItemDefinition => {
    const checked = appliesToTarget({ appliesTo: tag.appliesTo, target })
    return {
      kind: 'switch',
      key: `applies-${target}`,
      checked,
      disabled: isPending || (checked && tag.appliesTo !== 'both'),
      label: `Applies to ${target}`,
      onClick: () =>
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
        ),
    }
  }),
  {
    kind: 'switch',
    key: 'inherited',
    checked: !!tag.inherited,
    disabled: isPending,
    label: 'Minifigs inherit it from their sets',
    onClick: () =>
      run(
        state &&
          editTag({
            state,
            id: tag.id,
            changes: { inherited: !tag.inherited },
          }),
        `Turned ${tag.inherited ? 'off' : 'on'} inheritance of ${tag.label}`
      ),
  },
]

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
  const items: MenuItemDefinition[] = tag
    ? [
        {
          kind: 'action',
          key: 'rename',
          disabled: isPending,
          icon: <MdTextFields />,
          label: 'Rename',
          onClick: () => onRename(tag),
        },
        {
          kind: 'action',
          key: 'add',
          disabled: isPending,
          icon: <MdAdd />,
          label: 'Add a tag inside',
          onClick: () => onAdd(tag),
        },
        ...(tag.parent
          ? []
          : rootTagSettingsItems({ tag, state, isPending, run })),
        { kind: 'divider', key: 'danger' },
        {
          kind: 'action',
          key: 'delete',
          disabled: isPending || isProtectedTag(tag.id),
          icon: <MdDelete />,
          label: 'Delete',
          onClick: () => onDelete(tag),
        },
      ]
    : []
  return (
    <Menu
      anchor={anchor}
      disableEnforceFocus
      disableRestoreFocus
      items={items}
      onClose={onClose}
    />
  )
}

export default TagMenu
