import type { FC } from 'react'

import { ListItemIcon, MenuItem, Switch } from '@mui/material'

type TagMenuSwitchProps = {
  checked: boolean
  disabled: boolean
  label: string
  onClick: () => void
}

const TagMenuSwitch: FC<TagMenuSwitchProps> = ({
  checked,
  disabled,
  label,
  onClick,
}) => (
  <MenuItem
    aria-checked={checked}
    dense
    role="menuitemcheckbox"
    disabled={disabled}
    onClick={onClick}
  >
    <ListItemIcon>
      <Switch
        checked={checked}
        size="xsmall"
        slotProps={{ input: { tabIndex: -1, 'aria-hidden': true } }}
      />
    </ListItemIcon>
    {label}
  </MenuItem>
)

export default TagMenuSwitch
