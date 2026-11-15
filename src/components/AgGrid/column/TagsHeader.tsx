import type { CustomInnerHeaderProps } from 'ag-grid-react'
import { TagsDrawerButton } from 'components/TagsDrawer'
import { makeStyles } from 'tss-react/mui'

const useTagsHeaderStyles = makeStyles({ name: 'TagsHeader' })((theme) => ({
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(0.5),
    overflow: 'hidden',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))

const TagsHeader = ({ displayName }: CustomInnerHeaderProps) => {
  const { classes } = useTagsHeaderStyles()
  return (
    <div className={classes.header}>
      <span className={classes.label}>{displayName}</span>
      <TagsDrawerButton />
    </div>
  )
}

export default TagsHeader
