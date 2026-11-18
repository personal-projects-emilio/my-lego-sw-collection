import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'TimelineField' })((theme) => ({
  group: {
    alignItems: 'center',
    background: 'var(--era-color)',
    color: 'rgba(0, 0, 0, 0.87)',
    borderRadius: theme.spacing(2),
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    margin: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0.5, 0.5, 1.25),
    '& .MuiChip-root': {
      background: 'rgba(255, 255, 255, 0.45)',
      margin: 0,
    },
  },
  chip: {
    background: 'var(--era-color)',
    margin: theme.spacing(0.5),
    padding: theme.spacing(0, 0.5),
    color: 'rgba(0, 0, 0, 0.87)',
    '& .MuiChip-icon': { color: 'inherit', fontSize: 14 },
    '& .MuiChip-deleteIcon': {
      color: 'rgba(0, 0, 0, 0.5)',
      '&:hover': { color: 'rgba(0, 0, 0, 0.87)' },
    },
  },
  chipLabel: { display: 'inline-flex', alignItems: 'center', gap: 4 },
  select: {
    '& .MuiInputBase-root, & .MuiAutocomplete-input': { cursor: 'pointer' },
    '& .MuiAutocomplete-input': { caretColor: 'transparent' },
  },
  noInput: {
    '& .MuiAutocomplete-input': {
      flexGrow: '0 !important',
      minWidth: '0 !important',
      width: '0 !important',
      padding: '0 !important',
    },
  },
  lock: { opacity: 0.8 },
  chevron: { transition: 'transform 150ms' },
  chevronOpen: { transform: 'rotate(180deg)' },
  panel: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
}))
