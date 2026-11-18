import { makeStyles } from 'tss-react/mui'

const groupHeight = 48
const groupLayer = 20
const optionHeight = 36

const tint = (color: string) => `linear-gradient(${color}, ${color})`

export default makeStyles({ name: 'TagsAutocomplete' })((theme) => ({
  field: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  editButton: {
    marginTop: theme.spacing(2),
  },
  listbox: {
    padding: 0,
  },
  nestedList: {
    padding: 0,
  },
  groupHeader: {
    lineHeight: `${groupHeight}px`,
    zIndex: groupLayer,
  },
  option: {
    '&&&': {
      height: optionHeight,
      paddingLeft: `calc(var(--depth) * ${theme.spacing(2)})`,
    },
  },
  subtree: {
    padding: 0,
    '&&&&& > li:first-of-type': {
      backgroundColor: theme.palette.background.paper,
      opacity: 1,
      position: 'sticky',
      top: `calc(${groupHeight}px + (var(--depth) - 1) * ${optionHeight}px)`,
      zIndex: `calc(${groupLayer} - var(--depth))`,
      '&.Mui-focused': {
        backgroundImage: tint(theme.palette.action.hover),
      },
      '&[aria-selected="true"]': {
        backgroundImage: tint(
          theme.alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity
          )
        ),
      },
      '&[aria-selected="true"].Mui-focused': {
        backgroundImage: tint(
          theme.alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity +
              theme.palette.action.hoverOpacity
          )
        ),
      },
      '&[aria-disabled="true"]': {
        color: theme.palette.text.disabled,
      },
    },
  },
  note: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    marginLeft: theme.spacing(1),
  },
  group: {
    alignItems: 'center',
    background: theme.palette.action.hover,
    border: `1px solid ${theme.palette.text.disabled}`,
    borderRadius: theme.spacing(2),
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    margin: theme.spacing(0.25),
    padding: theme.spacing(0.25, 0.25, 0.25, 1),
  },
}))
