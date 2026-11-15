import {
  type CSSProperties,
  type FC,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  MdAdd,
  MdChevronRight,
  MdClose,
  MdDragIndicator,
  MdExpandMore,
  MdMoreVert,
  MdUndo,
  MdUnfoldLess,
  MdUnfoldMore,
} from 'react-icons/md'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Alert,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCollection, useTagsVocabulary } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import type { Tag, TaggedItem, TagId } from 'types/tags'
import {
  addTag,
  deleteTag,
  editTag,
  isProtectedTag,
  moveTag,
  type TagEdit,
  type TagsState,
  tagUsage,
  timelineRootId,
  undoTagEdit,
} from 'utils/tags'
import { type FlatNode, projectDrop } from 'utils/tree'

import DeleteTagDialog from './DeleteTagDialog'
import useTagsMutations from './useTagsMutations'

const indent = 24

const kinds: Array<Tag['kind']> = ['movie', 'show', 'game', 'other']

type Target = 'sets' | 'minifigs'

const targets: Target[] = ['sets', 'minifigs']

const appliesToTarget = (appliesTo: Tag['appliesTo'], target: Target) =>
  appliesTo === 'both' || appliesTo === target

const toggledAppliesTo = (
  appliesTo: Tag['appliesTo'],
  target: Target
): Tag['appliesTo'] => {
  const other: Target = target === 'sets' ? 'minifigs' : 'sets'
  if (!appliesToTarget(appliesTo, target)) return 'both'
  return appliesToTarget(appliesTo, other) ? other : appliesTo
}

const useTagsDrawerStyles = makeStyles({ name: 'TagsDrawer' })((theme) => ({
  drawer: {
    zIndex: theme.zIndex.modal,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    width: 'min(480px, 100vw)',
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1, 1, 2),
  },
  title: {
    flex: 1,
  },
  alert: {
    margin: theme.spacing(0, 2, 1),
  },
  list: {
    flex: 1,
    listStyle: 'none',
    margin: 0,
    overflowY: 'auto',
    padding: theme.spacing(0, 1, 2),
  },
  row: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    gap: theme.spacing(0.5),
    minHeight: 36,
    paddingLeft: `calc(var(--depth) * ${indent}px)`,
  },
  dragging: {
    boxShadow: theme.shadows[4],
    outline: `1px solid ${theme.palette.primary.main}`,
    position: 'relative',
    zIndex: 1,
  },
  dropTarget: {
    backgroundColor: theme.alpha(
      theme.palette.primary.main,
      theme.palette.action.selectedOpacity
    ),
    outline: `1px dashed ${theme.palette.primary.main}`,
  },
  dropNote: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    maxWidth: '60%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  refused: {
    color: theme.palette.error.main,
  },
  footer: {
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
  },
  handle: {
    alignItems: 'center',
    borderRadius: '50%',
    color: theme.palette.action.active,
    cursor: 'grab',
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: theme.typography.pxToRem(18),
    padding: 5,
    touchAction: 'none',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
  toggleSpacer: {
    flexShrink: 0,
    width: 28,
  },
  switchItem: {
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
  label: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  root: {
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  input: {
    flex: 1,
  },
}))

type Editing = { id: TagId } | { parent?: TagId }

type LabelInputProps = {
  className: string
  defaultValue?: string
  onCancel: () => void
  onCommit: (label: string) => void
}

const LabelInput: FC<LabelInputProps> = ({
  className,
  defaultValue = '',
  onCancel,
  onCommit,
}) => (
  <TextField
    autoFocus
    className={className}
    defaultValue={defaultValue}
    onBlur={(event) =>
      event.target.value.trim() && event.target.value !== defaultValue
        ? onCommit(event.target.value)
        : onCancel()
    }
    onKeyDown={(event) => {
      if (event.key === 'Enter')
        event.currentTarget.querySelector('input')?.blur()
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCancel()
      }
    }}
    placeholder="Tag label"
    size="small"
    slotProps={{ htmlInput: { 'aria-label': 'Tag label' } }}
    variant="standard"
  />
)

type TagRowProps = {
  depth: number
  details?: string
  dropNote?: { refused: boolean; text: string }
  editing: boolean
  expanded?: boolean
  id: TagId
  isDropTarget: boolean
  isRoot: boolean
  label: string
  rowActions: RowActions
}

type RowActions = {
  menu: (id: TagId, anchor: HTMLElement) => void
  rename: (id: TagId, label: string) => void
  stopEditing: () => void
  toggle: (id: TagId) => void
}

type TagRowContentProps = Omit<TagRowProps, 'depth' | 'isDropTarget'>

const TagRowContent = memo<TagRowContentProps>(
  ({ details, dropNote, editing, expanded, id, isRoot, label, rowActions }) => {
    const { classes, cx } = useTagsDrawerStyles()
    return (
      <>
        {expanded === undefined ? (
          <span className={classes.toggleSpacer} />
        ) : (
          <IconButton
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
            onClick={() => rowActions.toggle(id)}
            size="small"
          >
            {expanded ? (
              <MdExpandMore fontSize="inherit" />
            ) : (
              <MdChevronRight fontSize="inherit" />
            )}
          </IconButton>
        )}
        {editing ? (
          <LabelInput
            className={classes.input}
            defaultValue={label}
            onCancel={rowActions.stopEditing}
            onCommit={(newLabel) => rowActions.rename(id, newLabel)}
          />
        ) : (
          <Typography
            className={cx(classes.label, isRoot && classes.root)}
            variant="body2"
          >
            {label}
          </Typography>
        )}
        {dropNote ? (
          <Typography
            className={cx(
              classes.dropNote,
              dropNote.refused && classes.refused
            )}
            variant="caption"
          >
            {dropNote.text}
          </Typography>
        ) : (
          details && (
            <Typography color="textSecondary" variant="caption">
              {details}
            </Typography>
          )
        )}
        <IconButton
          aria-label={`Actions for ${label}`}
          onClick={(event) => rowActions.menu(id, event.currentTarget)}
          size="small"
        >
          <MdMoreVert fontSize="inherit" />
        </IconButton>
      </>
    )
  }
)

const TagRow: FC<TagRowProps> = ({ depth, isDropTarget, ...content }) => {
  const { classes, cx } = useTagsDrawerStyles()
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: content.id })
  return (
    <li
      ref={setNodeRef}
      className={cx(
        classes.row,
        isDragging && classes.dragging,
        isDropTarget && classes.dropTarget
      )}
      style={
        {
          '--depth': depth,
          transform: CSS.Translate.toString(transform),
          transition,
        } as CSSProperties
      }
    >
      <span
        ref={setActivatorNodeRef}
        aria-label={`Move ${content.label}`}
        className={classes.handle}
        {...attributes}
        {...listeners}
      >
        <MdDragIndicator />
      </span>
      <TagRowContent {...content} />
    </li>
  )
}

const TagsDrawer: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { classes } = useTagsDrawerStyles()
  const tagsVocabulary = useTagsVocabulary()
  const { state, applyTagsState, isPending } = useTagsMutations()
  const [error, setError] = useState<string>()
  const [editing, setEditing] = useState<Editing>()
  const [menu, setMenu] = useState<{ anchor: HTMLElement; id: TagId }>()
  const [deleting, setDeleting] = useState<Tag>()
  const [drag, setDrag] = useState<{
    activeId: TagId
    overId?: TagId
    depthDelta: number
  }>()
  const activeId = drag?.activeId
  const [history, setHistory] = useState<
    Array<{ description: string; before: TagsState; after: TagsState }>
  >([])
  const lastEdit = history[history.length - 1]
  const [expanded, setExpanded] = useState<ReadonlySet<TagId>>(new Set())
  const expand = (id: TagId | undefined) =>
    id &&
    setExpanded((ids) =>
      ids.has(id)
        ? ids
        : new Set([
            ...ids,
            ...tagsVocabulary.ancestors(id).map((t) => t.id),
            id,
          ])
    )
  const toggle = useCallback(
    (id: TagId) =>
      setExpanded((ids) =>
        ids.has(id)
          ? new Set([...ids].filter((other) => other !== id))
          : new Set([...ids, id])
      ),
    []
  )
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tagsList = useMemo(() => state?.tagsList ?? [], [state])
  const tagsById = useMemo(
    () => new Map(tagsList.map((tag) => [tag.id, tag])),
    [tagsList]
  )
  const parents = useMemo(
    () => new Set(tagsList.flatMap(({ parent }) => (parent ? [parent] : []))),
    [tagsList]
  )
  const collection = useCollection()
  const usage = useMemo(() => {
    const count = (items: TaggedItem[] = []) => {
      const counts = new Map<TagId, number>()
      items.forEach(({ effectiveTags }) =>
        new Set(
          effectiveTags.flatMap((id) => [
            id,
            tagsVocabulary.rootOf(id)?.id ?? id,
          ])
        ).forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1))
      )
      return counts
    }
    return {
      sets: count(collection.setsList),
      minifigs: count(collection.minifigsList),
    }
  }, [collection.setsList, collection.minifigsList, tagsVocabulary])
  const draggedParent = activeId && parents.has(activeId) ? activeId : undefined
  const nodes = useMemo(
    (): FlatNode[] =>
      tagsVocabulary
        .sort(tagsList.map(({ id }) => id))
        .filter((id) =>
          tagsVocabulary
            .ancestors(id)
            .every((tag) => tag.id !== draggedParent && expanded.has(tag.id))
        )
        .map((id) => ({
          id,
          parent: tagsById.get(id)?.parent,
          depth: tagsVocabulary.depth(id),
        })),
    [tagsVocabulary, tagsList, tagsById, draggedParent, expanded]
  )

  const fullPath = (id: TagId) =>
    [
      ...tagsVocabulary
        .ancestors(id)
        .reverse()
        .map(({ label }) => label),
      tagsVocabulary.label(id),
    ].join(' › ')

  const drop = useMemo(() => {
    if (!state || !drag?.overId) return undefined
    const target = projectDrop(nodes, {
      activeId: drag.activeId,
      overId: drag.overId,
      depthDelta: drag.depthDelta,
    })
    const edit = moveTag(state, drag.activeId, target)
    return {
      ...target,
      depth: target.parent ? tagsVocabulary.depth(target.parent) + 1 : 0,
      refused: 'refused' in edit ? edit.refused : undefined,
    }
  }, [state, drag, nodes, tagsVocabulary])

  const run = useCallback(
    (edit: TagEdit | undefined, description: string) => {
      if (!edit || !state) return
      if ('refused' in edit) {
        setError(edit.refused)
        return
      }
      setError(undefined)
      const before = state
      applyTagsState(edit.state)
        .then(() =>
          setHistory((entries) => [
            ...entries,
            { description, before, after: edit.state },
          ])
        )
        .catch(() => setError('The change could not be saved'))
    },
    [state, applyTagsState]
  )

  const rowActions = useMemo(
    (): RowActions => ({
      menu: (id, anchor) => setMenu({ anchor, id }),
      rename: (id, label) => {
        setEditing(undefined)
        run(
          state && editTag(state, id, { label }),
          `Renamed ${tagsById.get(id)?.label} to ${label.trim()}`
        )
      },
      stopEditing: () => setEditing(undefined),
      toggle,
    }),
    [run, state, tagsById, toggle]
  )

  const sortableItems = useMemo(() => nodes.map(({ id }) => id), [nodes])

  const undo = () => {
    if (!state || !lastEdit) return
    setError(undefined)
    applyTagsState(undoTagEdit(state, lastEdit))
      .then(() => setHistory((entries) => entries.slice(0, -1)))
      .catch(() => setError('The undo could not be saved'))
  }

  const onDragMove = ({ active, over, delta }: DragMoveEvent) => {
    const overId = over ? String(over.id) : undefined
    const depthDelta = Math.round(delta.x / indent)
    setDrag((current) =>
      current && current.overId === overId && current.depthDelta === depthDelta
        ? current
        : { activeId: String(active.id), overId, depthDelta }
    )
  }

  const onDragEnd = ({ active, over, delta }: DragEndEvent) => {
    setDrag(undefined)
    const depthDelta = Math.round(delta.x / indent)
    if (!state || !over || (active.id === over.id && !depthDelta)) return
    const id = String(active.id)
    const target = projectDrop(nodes, {
      activeId: id,
      overId: String(over.id),
      depthDelta,
    })
    expand(target.parent)
    run(
      moveTag(state, id, target),
      target.parent === tagsById.get(id)?.parent
        ? `Reordered ${tagsVocabulary.label(id)}`
        : `Moved ${tagsVocabulary.label(id)} into ${target.parent ? fullPath(target.parent) : 'the top level'}`
    )
  }

  const askDelete = (tag: Tag) => {
    if (!state) return
    const usage = tagUsage(state, [tag.id])
    if (tag.parent && !usage.sets.length && !usage.minifigs.length) {
      run(deleteTag(state, tag.id), `Deleted ${tag.label}`)
      return
    }
    setDeleting(tag)
  }

  const usageLabel = (tag: Tag) => {
    const sets = usage.sets.get(tag.id) ?? 0
    const minifigs = usage.minifigs.get(tag.id) ?? 0
    return [sets && `${sets} sets`, minifigs && `${minifigs} minifigs`]
  }

  const details = (tag: Tag) =>
    [
      ...(tag.parent
        ? [tag.kind]
        : [
            tag.appliesTo === 'both' ? 'sets & minifigs' : tag.appliesTo,
            tag.inherited && 'inherited',
          ]),
      ...usageLabel(tag),
    ]
      .filter(Boolean)
      .join(' · ')

  const closeMenu = () => setMenu(undefined)
  const menuTag = menu && tagsById.get(menu.id)
  const isTimelineTag = (tag: Tag) =>
    tagsVocabulary.rootOf(tag.id)?.id === timelineRootId

  return (
    <Drawer
      anchor="right"
      className={classes.drawer}
      onClose={onClose}
      open
      slotProps={{ paper: { className: classes.paper } }}
    >
      <div className={classes.header}>
        <Typography className={classes.title} component="h2" variant="h6">
          Tags
        </Typography>
        <Button
          disabled={!state}
          loading={isPending}
          onClick={() => setEditing({})}
          startIcon={<MdAdd />}
        >
          Add root
        </Button>
        <Tooltip title="Expand all">
          <IconButton
            aria-label="Expand all"
            onClick={() => setExpanded(new Set(parents))}
          >
            <MdUnfoldMore />
          </IconButton>
        </Tooltip>
        <Tooltip title="Collapse all">
          <IconButton
            aria-label="Collapse all"
            onClick={() => setExpanded(new Set())}
          >
            <MdUnfoldLess />
          </IconButton>
        </Tooltip>
        <IconButton aria-label="Close" onClick={onClose}>
          <MdClose />
        </IconButton>
      </div>
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
      {editing && !('id' in editing) && (
        <div className={classes.header}>
          <Typography variant="body2">
            {editing.parent
              ? `New tag in ${tagsVocabulary.label(editing.parent)}:`
              : 'New root:'}
          </Typography>
          <LabelInput
            className={classes.input}
            onCancel={() => setEditing(undefined)}
            onCommit={(label) => {
              setEditing(undefined)
              run(
                state && addTag(state, { label, parent: editing.parent }),
                `Added ${label.trim()}`
              )
            }}
          />
        </div>
      )}
      <DndContext
        collisionDetection={closestCenter}
        onDragCancel={() => setDrag(undefined)}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onDragStart={({ active }) =>
          setDrag({ activeId: String(active.id), depthDelta: 0 })
        }
        sensors={sensors}
      >
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          <ul aria-label="Tag tree" className={classes.list}>
            {nodes.map(({ id, depth }) => {
              const tag = tagsById.get(id)
              if (!tag) return null
              const isDropped = id === activeId && drop
              return (
                <TagRow
                  key={id}
                  depth={isDropped ? drop.depth : depth}
                  details={details(tag)}
                  dropNote={
                    isDropped
                      ? {
                          refused: !!drop.refused,
                          text:
                            drop.refused ??
                            `Into ${drop.parent ? fullPath(drop.parent) : 'the top level'}`,
                        }
                      : undefined
                  }
                  isDropTarget={!!drop && !drop.refused && drop.parent === id}
                  editing={!!editing && 'id' in editing && editing.id === id}
                  expanded={parents.has(id) ? expanded.has(id) : undefined}
                  id={id}
                  isRoot={!tag.parent}
                  label={tag.label}
                  rowActions={rowActions}
                />
              )
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <Menu
        anchorEl={menu?.anchor}
        disableRestoreFocus
        onClose={closeMenu}
        open={!!menu}
      >
        {menuTag && [
          <MenuItem
            key="rename"
            onClick={() => {
              closeMenu()
              setEditing({ id: menuTag.id })
            }}
          >
            Rename
          </MenuItem>,
          <MenuItem
            key="add"
            onClick={() => {
              closeMenu()
              expand(menuTag.id)
              setEditing({ parent: menuTag.id })
            }}
          >
            Add a tag inside
          </MenuItem>,
          ...(menuTag.parent && !isTimelineTag(menuTag)
            ? []
            : [<Divider key="settings" />]),
          ...(menuTag.parent
            ? (isTimelineTag(menuTag) ? [undefined, ...kinds] : []).map(
                (kind) => (
                  <MenuItem
                    key={`kind-${kind}`}
                    dense
                    onClick={() => {
                      closeMenu()
                      run(
                        state && editTag(state, menuTag.id, { kind }),
                        `Set ${menuTag.label} as ${kind ? `a ${kind}` : 'not a title'}`
                      )
                    }}
                    selected={menuTag.kind === kind}
                  >
                    {kind ? `Title: ${kind}` : 'Not a title'}
                  </MenuItem>
                )
              )
            : [
                ...targets.map((target) => {
                  const checked = appliesToTarget(menuTag.appliesTo, target)
                  return (
                    <MenuItem
                      key={`applies-${target}`}
                      className={classes.switchItem}
                      dense
                      disabled={checked && menuTag.appliesTo !== 'both'}
                      onClick={() =>
                        run(
                          state &&
                            editTag(state, menuTag.id, {
                              appliesTo: toggledAppliesTo(
                                menuTag.appliesTo,
                                target
                              ),
                            }),
                          `${checked ? 'Stopped' : 'Started'} applying ${menuTag.label} to ${target}`
                        )
                      }
                    >
                      {`Applies to ${target}`}
                      <Switch
                        checked={checked}
                        edge="end"
                        size="small"
                        slotProps={{ input: { tabIndex: -1 } }}
                      />
                    </MenuItem>
                  )
                }),
                <MenuItem
                  key="inherited"
                  className={classes.switchItem}
                  dense
                  onClick={() =>
                    run(
                      state &&
                        editTag(state, menuTag.id, {
                          inherited: !menuTag.inherited,
                        }),
                      `Turned ${menuTag.inherited ? 'off' : 'on'} inheritance of ${menuTag.label}`
                    )
                  }
                >
                  Minifigs inherit it from their sets
                  <Switch
                    checked={!!menuTag.inherited}
                    edge="end"
                    size="small"
                    slotProps={{ input: { tabIndex: -1 } }}
                  />
                </MenuItem>,
              ]),
          <Divider key="danger" />,
          <MenuItem
            key="delete"
            disabled={isProtectedTag(menuTag.id)}
            onClick={() => {
              closeMenu()
              askDelete(menuTag)
            }}
          >
            Delete
          </MenuItem>,
        ]}
      </Menu>
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
          title={lastEdit ? `Undo: ${lastEdit.description}` : 'Nothing to undo'}
        >
          <span>
            <Button
              disabled={!lastEdit}
              loading={isPending}
              onClick={undo}
              startIcon={<MdUndo />}
            >
              Undo
            </Button>
          </span>
        </Tooltip>
        {lastEdit && (
          <Typography
            className={classes.label}
            color="textSecondary"
            variant="caption"
          >
            {lastEdit.description}
          </Typography>
        )}
      </div>
    </Drawer>
  )
}

export default TagsDrawer
