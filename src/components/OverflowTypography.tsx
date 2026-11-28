import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Tooltip,
  type TooltipProps,
  Typography,
  type TypographyProps,
} from '@mui/material'

type OverflowTypographyProps = TypographyProps & {
  tooltipProps?: Omit<TooltipProps, 'title' | 'children'>
  tooltipTitle?: ReactNode
}

const OverflowTypography: FC<PropsWithChildren<OverflowTypographyProps>> = ({
  children,
  tooltipProps,
  tooltipTitle,
  ...props
}) => {
  const textElementRef = useRef<HTMLSpanElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  const compareSize = () => {
    if (!textElementRef?.current) return

    const compare =
      textElementRef.current.scrollWidth > textElementRef.current.clientWidth
    setShowTooltip(compare)
  }

  useEffect(() => {
    compareSize()
    window.addEventListener('resize', compareSize)
    return () => window.removeEventListener('resize', compareSize)
  }, [])

  const typographyProps = {
    ...props,
    ref: textElementRef,
    noWrap: true,
  }

  if (!showTooltip) {
    return <Typography {...typographyProps}>{children}</Typography>
  }

  return (
    <Tooltip arrow title={tooltipTitle ?? children} {...tooltipProps}>
      <Typography {...typographyProps}>{children}</Typography>
    </Tooltip>
  )
}

export default OverflowTypography
