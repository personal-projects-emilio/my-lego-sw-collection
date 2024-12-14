import { forwardRef } from 'react'

import {
  Avatar as MuiAvatar,
  type AvatarProps as MuiAvatarProps,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import type { OverrideProperties } from 'type-fest'

type AvatarProps = OverrideProperties<
  MuiAvatarProps,
  { variant?: Exclude<NonNullable<MuiAvatarProps['variant']>, 'square'> }
>

const useStyles = makeStyles<void, NonNullable<AvatarProps['variant']>>({
  name: 'Avatar',
})((theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.dark,
    fontSize: theme.typography.button.fontSize,
  },
  circular: {
    height: 24,
    width: 24,
  },
  rounded: {
    height: 24,
    minWidth: 24,
    padding: theme.spacing(0, 0.5),
    width: 'unset',
  },
}))

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ children, variant = 'circular', className, ...avatarProps }, ref) => {
    const { classes, cx } = useStyles()

    return (
      <MuiAvatar
        {...avatarProps}
        ref={ref}
        className={cx(classes.avatar, classes[variant], className)}
        variant={variant}
      >
        {children}
      </MuiAvatar>
    )
  }
)

export default Avatar
