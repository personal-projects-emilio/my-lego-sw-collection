import { type FC, useEffect, useRef } from 'react'
import { MdEdit } from 'react-icons/md'

import { IconButton, Tooltip } from '@mui/material'

import { useOpenTagsDrawer } from './openTagsDrawerContext'

export const tagsDrawerButtonLabel = 'Edit the tag vocabulary'

const TagsDrawerButton: FC<{ className?: string }> = ({ className }) => {
  const openTagsDrawer = useOpenTagsDrawer()
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = ref.current
    if (!button) return
    const onClick = (event: MouseEvent) => {
      event.stopPropagation()
      openTagsDrawer()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
    }
    const onTouchStart = (event: TouchEvent) => event.stopPropagation()
    button.addEventListener('click', onClick)
    button.addEventListener('keydown', onKeyDown)
    button.addEventListener('touchstart', onTouchStart, { passive: true })
    return () => {
      button.removeEventListener('click', onClick)
      button.removeEventListener('keydown', onKeyDown)
      button.removeEventListener('touchstart', onTouchStart)
    }
  }, [openTagsDrawer])

  return (
    <Tooltip title={tagsDrawerButtonLabel}>
      <IconButton
        ref={ref}
        aria-label={tagsDrawerButtonLabel}
        className={className}
        size="small"
      >
        <MdEdit fontSize="inherit" />
      </IconButton>
    </Tooltip>
  )
}

export default TagsDrawerButton
