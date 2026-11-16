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
  MdCheck,
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
  type SortingStrategy,
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
  InputAdornment,
  Menu,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCollection, useTagsVocabulary } from 'hooks'
import { isEqual } from 'lodash'
import { makeStyles } from 'tss-react/mui'
import type { Tag, TaggedItem, TagId } from 'types/tags'
import {
  addTag,
  editTag,
  isProtectedTag,
  moveTag,
  sortAlphabetically,
  type TagEdit,
  type TagsState,
  timelineRootId,
  undoTagEdit,
} from 'utils/tags'
import { type FlatNode, projectDrop } from 'utils/tree'

import DeleteTagDialog from './DeleteTagDialog'
import useDrawerWidth from './useDrawerWidth'
import useTagsMutations, { PartlySavedError } from './useTagsMutations'

const saveError = (fallback: string) => (err: unknown) =>
  err instanceof PartlySavedError ? err.message : fallback

const indent = 24

const keepInPlace: SortingStrategy = () => null

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

const useTagsDrawerStyles = makeStyles<void, 'addButton'>({
  name: 'TagsDrawer',
})((theme, _params, classes) => ({
  drawer: {
    zIndex: theme.zIndex.modal,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100vw',
  },
  resizeHandle: {
    bottom: 0,
    cursor: 'col-resize',
    left: 0,
    position: 'absolute',
    top: 0,
    touchAction: 'none',
    width: 6,
    zIndex: 1,
    '&:hover, &:focus-visible, &:active': {
      backgroundColor: theme.palette.primary.main,
      outline: 'none',
    },
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
    [`&:hover .${classes.addButton}, &:focus-within .${classes.addButton}`]: {
      opacity: 1,
    },
  },
  addButton: {
    opacity: 0,
    '@media (hover: none)': {
      opacity: 1,
    },
  },
  actions: {
    display: 'flex',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  handleSpacer: {
    flexShrink: 0,
    width: 28,
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
  name: {
    flex: '0 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  details: {
    flex: '1 1 0',
    minWidth: 0,
    textAlign: 'right',
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
  placeholder?: string
  siblingLabels: string[]
}

const normalized = (label: string) => label.trim().toLocaleLowerCase()

const LabelInput: FC<LabelInputProps> = ({
  className,
  defaultValue = '',
  onCancel,
  onCommit,
  placeholder = 'Tag label',
  siblingLabels,
}) => {
  const [value, setValue] = useState(defaultValue)
  const keepFocus = (event: React.MouseEvent) => event.preventDefault()
  const commit = () =>
    value.trim() && value !== defaultValue ? onCommit(value) : onCancel()
  const duplicate =
    !!value.trim() &&
    siblingLabels.some((label) => normalized(label) === normalized(value))
  return (
    <TextField
      autoFocus
      className={className}
      color={duplicate ? 'warning' : undefined}
      focused={duplicate || undefined}
      helperText={duplicate && 'Another tag here has this label'}
      onBlur={() => document.hasFocus() && onCancel()}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit()
        if (event.key === 'Escape') {
          event.stopPropagation()
          onCancel()
        }
      }}
      placeholder={placeholder}
      size="small"
      value={value}
      slotProps={{
        htmlInput: { 'aria-label': 'Tag label' },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Save the label"
                onClick={commit}
                onMouseDown={keepFocus}
                size="small"
              >
                <MdCheck fontSize="inherit" />
              </IconButton>
              <IconButton
                aria-label="Cancel"
                onClick={onCancel}
                onMouseDown={keepFocus}
                size="small"
              >
                <MdClose fontSize="inherit" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      variant="standard"
    />
  )
}

type TagRowProps = {
  depth: number
  disabled: boolean
  details?: string
  dropNote?: { refused: boolean; text: string }
  editing: boolean
  expanded?: boolean
  id: TagId
  isDropTarget: boolean
  isRoot: boolean
  label: string
  rowActions: RowActions
  siblingLabels?: string[]
}

type RowActions = {
  add: (id: TagId) => void
  menu: (id: TagId, anchor: HTMLElement) => void
  startRenaming: (id: TagId) => void
  rename: (id: TagId, label: string) => void
  stopEditing: () => void
  toggle: (id: TagId) => void
}

type TagRowContentProps = Omit<TagRowProps, 'depth' | 'isDropTarget'>

const TagRowContent = memo<TagRowContentProps>(
  ({
    details,
    dropNote,
    disabled,
    editing,
    expanded,
    id,
    isRoot,
    label,
    rowActions,
    siblingLabels = [],
  }) => {
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
            siblingLabels={siblingLabels}
          />
        ) : (
          <Typography
            className={cx(classes.name, isRoot && classes.root)}
            onDoubleClick={() => !disabled && rowActions.startRenaming(id)}
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
          !editing &&
          details && (
            <Typography
              className={classes.details}
              color="textSecondary"
              title={details}
              variant="caption"
            >
              {details}
            </Typography>
          )
        )}
        <span className={classes.actions}>
          {!editing && (
            <Tooltip title={`Add a tag inside ${label}`}>
              <IconButton
                aria-label={`Add a tag inside ${label}`}
                className={classes.addButton}
                disabled={disabled}
                onClick={() => rowActions.add(id)}
                size="small"
              >
                <MdAdd fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            aria-label={`Actions for ${label}`}
            onClick={(event) => rowActions.menu(id, event.currentTarget)}
            size="small"
          >
            <MdMoreVert fontSize="inherit" />
          </IconButton>
        </span>
      </>
    )
  }
)

const TagRow: FC<TagRowProps> = ({ depth, isDropTarget, ...content }) => {
  const { disabled } = content
  const { classes, cx } = useTagsDrawerStyles()
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ disabled, id: content.id })
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
          transform: CSS.Translate.toString(
            transform && { ...transform, x: 0 }
          ),
          transition,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        if (event.key === 'F2' && !disabled && !content.editing)
          content.rowActions.startRenaming(content.id)
      }}
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
  const { width, handleProps } = useDrawerWidth()
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
  const descendants = useMemo(() => {
    const counts = new Map<TagId, number>()
    tagsList.forEach(({ id }) =>
      tagsVocabulary
        .ancestors(id)
        .forEach((tag) => counts.set(tag.id, (counts.get(tag.id) ?? 0) + 1))
    )
    return counts
  }, [tagsList, tagsVocabulary])
  const tagsCount = tagsList.filter(({ parent }) => parent).length
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

  const projectSortedDrop = useCallback(
    (drop: { activeId: TagId; overId: TagId; depthDelta: number }) => {
      const target = projectDrop(nodes, drop)
      const alphabetical =
        !!target.parent && !!tagsById.get(target.parent)?.alphabetical
      return {
        ...target,
        alphabetical,
        stays:
          alphabetical && target.parent === tagsById.get(drop.activeId)?.parent,
      }
    },
    [nodes, tagsById]
  )

  const drop = useMemo(() => {
    if (!state || !drag?.overId) return undefined
    const target = projectSortedDrop({ ...drag, overId: drag.overId })
    const edit = target.stays
      ? undefined
      : moveTag(state, drag.activeId, target)
    return {
      ...target,
      depth: target.parent ? tagsVocabulary.depth(target.parent) + 1 : 0,
      refused: edit && 'refused' in edit ? edit.refused : undefined,
    }
  }, [state, drag, projectSortedDrop, tagsVocabulary])

  const run = useCallback(
    (edit: TagEdit | undefined, description: string) => {
      if (!edit || !state) return
      if ('refused' in edit) {
        setError(edit.refused)
        return
      }
      if (isPending) {
        setError('Wait for the previous change to be saved')
        return
      }
      setError(undefined)
      if (
        edit.state.setsList === state.setsList &&
        edit.state.minifigsList === state.minifigsList &&
        isEqual(edit.state.tagsList, state.tagsList)
      )
        return
      const before = state
      applyTagsState(edit.state)
        .then(() =>
          setHistory((entries) => [
            ...entries,
            { description, before, after: edit.state },
          ])
        )
        .catch((err) =>
          setError(saveError('The change could not be saved')(err))
        )
    },
    [state, isPending, applyTagsState]
  )

  const rowActions = useMemo(
    (): RowActions => ({
      add: (id) => {
        setExpanded(
          (ids) =>
            new Set([
              ...ids,
              ...tagsVocabulary.ancestors(id).map((t) => t.id),
              id,
            ])
        )
        setEditing({ parent: id })
      },
      menu: (id, anchor) => setMenu({ anchor, id }),
      startRenaming: (id) => setEditing({ id }),
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
    [run, state, tagsById, tagsVocabulary, toggle]
  )

  const labelsUnder = (parent: TagId | undefined, except?: TagId) =>
    tagsList
      .filter((tag) => tag.parent === parent && tag.id !== except)
      .map(({ label }) => label)

  const adding = editing && !('id' in editing) ? editing : undefined
  const addAfter =
    adding?.parent &&
    [...nodes]
      .reverse()
      .find(
        ({ id }) =>
          id === adding.parent ||
          tagsVocabulary.ancestors(id).some((tag) => tag.id === adding.parent)
      )?.id
  const addRow = adding && (
    <li
      key="adding"
      className={classes.row}
      style={
        {
          '--depth': adding.parent
            ? tagsVocabulary.depth(adding.parent) + 1
            : 0,
        } as CSSProperties
      }
    >
      <span className={classes.handleSpacer} />
      <span className={classes.toggleSpacer} />
      <LabelInput
        className={classes.input}
        onCancel={() => setEditing(undefined)}
        onCommit={(label) => {
          setEditing(undefined)
          run(
            state && addTag(state, { label, parent: adding.parent }),
            `Added ${label.trim()}`
          )
        }}
        placeholder={
          adding.parent
            ? `New tag in ${tagsVocabulary.label(adding.parent)}${tagsById.get(adding.parent)?.alphabetical ? ', sorted A–Z' : ''}`
            : 'New root'
        }
        siblingLabels={labelsUnder(adding.parent)}
      />
    </li>
  )

  const sortableItems = useMemo(() => nodes.map(({ id }) => id), [nodes])

  const undo = () => {
    if (!state || !lastEdit || isPending) return
    setError(undefined)
    applyTagsState(undoTagEdit(state, lastEdit))
      .then(() => setHistory((entries) => entries.slice(0, -1)))
      .catch((err) => setError(saveError('The undo could not be saved')(err)))
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
    const target = projectSortedDrop({
      activeId: id,
      overId: String(over.id),
      depthDelta,
    })
    if (target.stays) return
    const edit = moveTag(state, id, target)
    if ('state' in edit) expand(target.parent)
    run(
      edit,
      target.parent === tagsById.get(id)?.parent
        ? `Reordered ${tagsVocabulary.label(id)}`
        : `Moved ${tagsVocabulary.label(id)} into ${target.parent ? fullPath(target.parent) : 'the top level'}`
    )
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
      tag.alphabetical && 'A–Z',
      descendants.has(tag.id) && `${descendants.get(tag.id)} tags`,
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
      onClose={() => !isPending && onClose()}
      open
      slotProps={{ paper: { className: classes.paper, style: { width } } }}
    >
      <div className={classes.resizeHandle} {...handleProps} />
      <div className={classes.header}>
        <Typography className={classes.title} component="h2" variant="h6">
          Tags
          {state && (
            <Typography
              color="textSecondary"
              component="span"
              variant="body2"
            >{` · ${tagsCount}`}</Typography>
          )}
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
        <IconButton aria-label="Close" disabled={isPending} onClick={onClose}>
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
          strategy={
            drop?.alphabetical ? keepInPlace : verticalListSortingStrategy
          }
        >
          <ul aria-label="Tag tree" className={classes.list}>
            {nodes.map(({ id, depth }) => {
              const tag = tagsById.get(id)
              if (!tag) return null
              const isDropped = id === activeId && drop
              const isEditing =
                !!editing && 'id' in editing && editing.id === id
              return [
                <TagRow
                  key={id}
                  depth={isDropped ? drop.depth : depth}
                  disabled={isPending}
                  details={details(tag)}
                  dropNote={
                    isDropped
                      ? {
                          refused: !!drop.refused,
                          text:
                            drop.refused ??
                            (drop.stays
                              ? `Stays in ${tagsById.get(drop.parent ?? '')?.label}, sorted A–Z`
                              : `Into ${drop.parent ? fullPath(drop.parent) : 'the top level'}${drop.alphabetical ? ', sorted A–Z' : ''}`),
                        }
                      : undefined
                  }
                  isDropTarget={
                    !!drop && !drop.refused && !drop.stays && drop.parent === id
                  }
                  editing={isEditing}
                  expanded={parents.has(id) ? expanded.has(id) : undefined}
                  id={id}
                  isRoot={!tag.parent}
                  label={tag.label}
                  rowActions={rowActions}
                  siblingLabels={
                    isEditing ? labelsUnder(tag.parent, id) : undefined
                  }
                />,
                id === addAfter && addRow,
              ]
            })}
            {adding && !adding.parent && addRow}
          </ul>
        </SortableContext>
      </DndContext>
      <Menu
        anchorEl={menu?.anchor}
        disableEnforceFocus
        disableRestoreFocus
        onClose={closeMenu}
        open={!!menu}
      >
        {menuTag && [
          <MenuItem
            key="rename"
            disabled={isPending}
            onClick={() => {
              closeMenu()
              setEditing({ id: menuTag.id })
            }}
          >
            Rename
          </MenuItem>,
          <MenuItem
            key="add"
            disabled={isPending}
            onClick={() => {
              closeMenu()
              rowActions.add(menuTag.id)
            }}
          >
            Add a tag inside
          </MenuItem>,
          ...(menuTag.parent &&
          !isTimelineTag(menuTag) &&
          !parents.has(menuTag.id) &&
          !menuTag.alphabetical
            ? []
            : [<Divider key="settings" />]),
          ...(parents.has(menuTag.id) || menuTag.alphabetical
            ? [
                <MenuItem
                  key="alphabetical"
                  className={classes.switchItem}
                  dense
                  disabled={isPending}
                  onClick={() =>
                    run(
                      state &&
                        sortAlphabetically(
                          state,
                          menuTag.id,
                          !menuTag.alphabetical
                        ),
                      `${menuTag.alphabetical ? 'Stopped sorting' : 'Sorted'} the tags of ${menuTag.label} A–Z`
                    )
                  }
                >
                  Sort A–Z, with all tags inside
                  <Switch
                    checked={!!menuTag.alphabetical}
                    edge="end"
                    size="small"
                    slotProps={{ input: { tabIndex: -1 } }}
                  />
                </MenuItem>,
              ]
            : []),
          ...(menuTag.parent
            ? (isTimelineTag(menuTag) ? [undefined, ...kinds] : []).map(
                (kind) => (
                  <MenuItem
                    key={`kind-${kind}`}
                    dense
                    disabled={isPending}
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
                      disabled={
                        isPending || (checked && menuTag.appliesTo !== 'both')
                      }
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
                  disabled={isPending}
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
            disabled={isPending || isProtectedTag(menuTag.id)}
            onClick={() => {
              closeMenu()
              setDeleting(menuTag)
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
