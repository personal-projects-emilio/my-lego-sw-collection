import { type FC, useMemo, useState } from 'react'
import { MdAdd, MdUndo, MdUnfoldLess, MdUnfoldMore } from 'react-icons/md'

import { closestCenter, DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import {
  Alert,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import SideDrawer from 'components/SideDrawer'
import type { Tag, TagId } from 'types/tags'
import { addTag, editTag } from 'utils/tags'

import AddTagRow from './AddTagRow'
import DeleteTagDialog from './DeleteTagDialog'
import TagMenu from './TagMenu'
import TagRow from './TagRow'
import useTagsDrawerStyles from './TagsDrawer.styles'
import {
  type Drag,
  type Editing,
  keepInPlace,
  type RowActions,
} from './tagTree'
import useTagDetails from './useTagDetails'
import useTagDrag from './useTagDrag'
import useTagEdits from './useTagEdits'
import useTagTree from './useTagTree'

const TagsDrawer: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { classes } = useTagsDrawerStyles()
  const { state, isPending, error, setError, run, lastEdit, undo } =
    useTagEdits()
  const [editing, setEditing] = useState<Editing>()
  const [menu, setMenu] = useState<{ anchor: HTMLElement; id: TagId }>()
  const [deleting, setDeleting] = useState<Tag>()
  const [drag, setDrag] = useState<Drag>()
  const tagsList = useMemo(() => state?.tagsList ?? [], [state])
  const tree = useTagTree({ tagsList, activeId: drag?.activeId })
  const { drop, getDropNote, isDropTarget, contextProps } = useTagDrag({
    state,
    tree,
    run,
    drag,
    setDrag,
  })
  const {
    nodes,
    tagsById,
    tagsVocabulary,
    parents,
    expanded,
    getLabelsUnder,
    expand,
    toggle,
  } = tree
  const details = useTagDetails(tree.descendants)
  const sortableItems = useMemo(() => nodes.map(({ id }) => id), [nodes])
  const tagsCount = state
    ? tagsList.filter(({ parent }) => parent).length
    : undefined
  const lastDescription = lastEdit?.description

  const rowActions = useMemo(
    (): RowActions => ({
      add: (id) => {
        expand(id)
        setEditing({ parent: id })
      },
      menu: (id, anchor) => setMenu({ anchor, id }),
      startRenaming: (id) => setEditing({ id }),
      rename: (id, label) => {
        setEditing(undefined)
        run(
          state && editTag({ state, id, changes: { label } }),
          `Renamed ${tagsById.get(id)?.label} to ${label.trim()}`
        )
      },
      stopEditing: () => setEditing(undefined),
      toggle,
    }),
    [run, state, tagsById, expand, toggle]
  )

  const adding = editing && !('id' in editing) ? editing : undefined
  const addAfter =
    adding?.parent &&
    [...nodes]
      .reverse()
      .find(
        ({ id }) =>
          id === adding.parent ||
          tagsVocabulary
            .getAncestors(id)
            .some((tag) => tag.id === adding.parent)
      )?.id
  const addRow = adding && (
    <AddTagRow
      key="adding"
      depth={adding.parent ? tagsVocabulary.getDepth(adding.parent) + 1 : 0}
      onCancel={() => setEditing(undefined)}
      onCommit={(label) => {
        setEditing(undefined)
        run(
          state && addTag({ state, label, parent: adding.parent }),
          `Added ${label.trim()}`
        )
      }}
      placeholder={
        adding.parent
          ? `New tag in ${tagsVocabulary.getLabel(adding.parent)}`
          : 'New root'
      }
      siblingLabels={getLabelsUnder({ parent: adding.parent })}
    />
  )

  return (
    <SideDrawer
      actions={
        <>
          <Button
            disabled={tagsCount === undefined}
            loading={isPending}
            onClick={() => setEditing({})}
            startIcon={<MdAdd />}
          >
            Add root
          </Button>
          <Tooltip title="Expand all">
            <IconButton aria-label="Expand all" onClick={tree.expandAll}>
              <MdUnfoldMore />
            </IconButton>
          </Tooltip>
          <Tooltip title="Collapse all">
            <IconButton aria-label="Collapse all" onClick={tree.collapseAll}>
              <MdUnfoldLess />
            </IconButton>
          </Tooltip>
        </>
      }
      defaultWidth={480}
      isCloseDisabled={isPending}
      minWidth={360}
      onClose={onClose}
      storageKey="tagsDrawerWidth"
      title={
        <>
          Tags
          {tagsCount !== undefined && (
            <Typography
              color="textSecondary"
              component="span"
              variant="body2"
            >{` · ${tagsCount}`}</Typography>
          )}
        </>
      }
    >
      {error && (
        <Alert
          className={classes.alert}
          onClose={() => setError(undefined)}
          severity="error"
        >
          {error}
        </Alert>
      )}
      <Divider />
      <DndContext collisionDetection={closestCenter} {...contextProps}>
        <SortableContext items={sortableItems} strategy={keepInPlace}>
          <ul aria-label="Tag tree" className={classes.list}>
            {nodes.map(({ id, depth }) => {
              const tag = tagsById.get(id)
              if (!tag) return null
              const isEditing =
                !!editing && 'id' in editing && editing.id === id
              return [
                <TagRow
                  key={id}
                  depth={id === drag?.activeId && drop ? drop.depth : depth}
                  disabled={isPending}
                  details={details(tag)}
                  dropNote={getDropNote(id)}
                  isDropTarget={isDropTarget(id)}
                  editing={isEditing}
                  expanded={parents.has(id) ? expanded.has(id) : undefined}
                  id={id}
                  isRoot={!tag.parent}
                  label={tag.label}
                  rowActions={rowActions}
                  siblingLabels={
                    isEditing
                      ? getLabelsUnder({ parent: tag.parent, except: id })
                      : undefined
                  }
                />,
                id === addAfter && addRow,
              ]
            })}
            {adding && !adding.parent && addRow}
          </ul>
        </SortableContext>
      </DndContext>
      <TagMenu
        anchor={menu?.anchor}
        tag={menu && tagsById.get(menu.id)}
        state={state}
        isPending={isPending}
        run={run}
        onClose={() => setMenu(undefined)}
        onRename={(tag) => setEditing({ id: tag.id })}
        onAdd={(tag) => rowActions.add(tag.id)}
        onDelete={setDeleting}
      />
      {deleting && state && (
        <DeleteTagDialog
          isPending={isPending}
          onClose={() => setDeleting(undefined)}
          onConfirm={(edit) => {
            setDeleting(undefined)
            run(edit, `Deleted ${deleting.label}`)
          }}
          state={state}
          tag={deleting}
        />
      )}
      <div className={classes.footer}>
        <Tooltip
          title={
            lastDescription ? `Undo: ${lastDescription}` : 'Nothing to undo'
          }
        >
          <span>
            <Button
              disabled={!lastDescription}
              loading={isPending}
              onClick={undo}
              startIcon={<MdUndo />}
            >
              Undo
            </Button>
          </span>
        </Tooltip>
        {lastDescription && (
          <Typography
            className={classes.label}
            color="textSecondary"
            variant="caption"
          >
            {lastDescription}
          </Typography>
        )}
      </div>
    </SideDrawer>
  )
}

export default TagsDrawer
