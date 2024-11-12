import { FC } from 'react'

import { type ButtonProps, IconButton, Tooltip } from '@mui/material'
import bricklinkLogo from 'assets/bricklink.png'
import bricksetLogo from 'assets/brickset.png'
import { makeStyles } from 'tss-react/mui'
import { Minifig } from 'types/minifigs'

// TODO: Add set support when adding Set page
type LogoLinkProps = {
  id: Minifig['id'] // | Set['id']
  target: 'bricklink' | 'brickset'
  variant: 'minifig' | 'set'
} & Pick<ButtonProps, 'size'>

type FormatUrlOrTooltip = (
  id: LogoLinkProps['id'],
  isMinifig: boolean
) => string

const mapLogoLinkTargetToProps = {
  bricklink: {
    alt: 'bricklink logo',
    src: bricklinkLogo,
    url: (id, isMinifig) =>
      `https://www.bricklink.com/v2/catalog/catalogitem.page?${isMinifig ? 'M' : 'S'}=${id}` as const,
    tooltip: (id, isMinifig) =>
      `Link to the bricklink page of the ${isMinifig ? 'minifig' : 'set'} ${id}` as const,
  },
  brickset: {
    alt: 'brickset logo',
    src: bricksetLogo,
    url: (id, isMinifig) =>
      `https://brickset.com/${isMinifig ? 'minifigs' : 'sets'}/${id}` as const,
    tooltip: (id, isMinifig) =>
      `Link to the brickset page of the ${isMinifig ? 'minifig' : 'set'} ${id}` as const,
  },
} as const satisfies Record<
  LogoLinkProps['target'],
  {
    url: FormatUrlOrTooltip
    tooltip: FormatUrlOrTooltip
    src: string
    alt: string
  }
>

const useStyles = makeStyles<void, NonNullable<ButtonProps['size']>>()({
  large: {
    '& img': {
      height: '28px',
      width: '28px',
    },
  },
  medium: {
    '& img': {
      height: '24px',
      width: '24px',
    },
  },
  small: {
    '& img': {
      height: '20px',
      width: '20px',
    },
  },
})

const LogoLink: FC<LogoLinkProps> = ({
  target,
  variant,
  id,
  size = 'medium',
}) => {
  const { classes } = useStyles()
  const { url, tooltip, ...rest } = mapLogoLinkTargetToProps[target]
  const isMinifig = variant === 'minifig'
  return (
    <Tooltip
      enterDelay={500}
      enterNextDelay={500}
      title={tooltip(id, isMinifig)}
    >
      <IconButton
        className={classes[size]}
        href={url(id, isMinifig)}
        size={size}
      >
        <img {...rest} />
      </IconButton>
    </Tooltip>
  )
}

export default LogoLink
