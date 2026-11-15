import { type FC, useEffect, useRef } from 'react'
import { MdEdit } from 'react-icons/md'

import { IconButton, Tooltip } from '@mui/material'

import { useOpenTagsDrawer } from './openTagsDrawerContext'

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
    const onKeyDown = (event: KeyboardEvent) => event.stopPropagation()
    button.addEventListener('click', onClick)
    button.addEventListener('keydown', onKeyDown)
    return () => {
      button.removeEventListener('click', onClick)
      button.removeEventListener('keydown', onKeyDown)
    }
  }, [openTagsDrawer])

  return (
    <Tooltip enterDelay={300} title="Edit the tag vocabulary">
      <IconButton
        ref={ref}
        aria-label="Edit the tag vocabulary"
        className={className}
        size="small"
      >
        <MdEdit fontSize="inherit" />
      </IconButton>
    </Tooltip>
  )
}

export default TagsDrawerButton
