import { type FC, type PropsWithChildren, useState } from 'react'

import { OpenTagsDrawerContext } from './openTagsDrawerContext'
import TagsDrawer from './TagsDrawer'

const TagsDrawerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [openTagsDrawer] = useState(() => () => setOpen(true))

  return (
    <OpenTagsDrawerContext.Provider value={openTagsDrawer}>
      {children}
      {open && <TagsDrawer onClose={() => setOpen(false)} />}
    </OpenTagsDrawerContext.Provider>
  )
}

export default TagsDrawerProvider
