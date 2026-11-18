import type { CSSProperties, FC } from 'react'

import LabelInput from './LabelInput'
import useTagsDrawerStyles from './TagsDrawer.styles'

type AddTagRowProps = {
  depth: number
  placeholder: string
  siblingLabels: string[]
  onCancel: () => void
  onCommit: (label: string) => void
}

const AddTagRow: FC<AddTagRowProps> = ({ depth, ...inputProps }) => {
  const { classes } = useTagsDrawerStyles()
  return (
    <li className={classes.row} style={{ '--depth': depth } as CSSProperties}>
      <span className={classes.handleSpacer} />
      <span className={classes.toggleSpacer} />
      <LabelInput className={classes.input} {...inputProps} />
    </li>
  )
}

export default AddTagRow
