import type { FC } from 'react'

import { type ButtonProps, IconButton, Tooltip } from '@mui/material'
import bricklinkLogo from 'assets/bricklink.png'
import bricksetLogo from 'assets/brickset.png'
import { makeStyles } from 'tss-react/mui'
import type { Item,ItemId } from 'types/common'

export type LogoLinkProps = {
  id: ItemId
  target: 'bricklink' | 'brickset'
  variant: Item
} & Pick<ButtonProps, 'size'>

const mapLogoLinkTargetToProps = {
  bricklink: (id, isMinifig) =>
    ({
      alt: 'Bricklink logo',
      src: bricklinkLogo,
      url: `https://www.bricklink.com/v2/catalog/catalogitem.page?${isMinifig ? 'M' : 'S'}=${id}`,
      tooltip: `Link to the bricklink page of the ${isMinifig ? 'minifig' : 'set'} ${id}`,
    }) as const,
  brickset: (id, isMinifig) =>
    ({
      alt: 'Brickset logo',
      src: bricksetLogo,
      url: `https://brickset.com/${isMinifig ? 'minifigs' : 'sets'}/${id}`,
      tooltip: `Link to the brickset page of the ${isMinifig ? 'minifig' : 'set'} ${id}`,
    }) as const,
} as const satisfies Record<
  LogoLinkProps['target'],
  (
    id: string,
    isMinifig: boolean
  ) => {
    url: string
    tooltip: string
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
  const { url, tooltip, alt, src } = mapLogoLinkTargetToProps[target](
    String(id),
    variant === 'minifig'
  )
  return (
    <Tooltip enterDelay={500} enterNextDelay={500} title={tooltip}>
      <IconButton className={classes[size]} href={url} size={size}>
        <img alt={alt} src={src} />
      </IconButton>
    </Tooltip>
  )
}

export default LogoLink
