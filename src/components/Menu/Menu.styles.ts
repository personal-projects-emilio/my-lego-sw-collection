import { makeStyles } from 'tss-react/mui'

export default makeStyles({ name: 'Menu' })((theme) => {
  const paper = {
    minWidth: 200,
    '& .MuiListItemIcon-root': {
      fontSize: theme.typography.pxToRem(18),
      justifyContent: 'center',
      marginRight: theme.spacing(1.5),
      minWidth: 0,
      width: 32,
    },
    '& .Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightBold,
    },
  }
  return {
    paper,
    submenu: {
      pointerEvents: 'none',
    },
    submenuPaper: {
      ...paper,
      pointerEvents: 'auto',
    },
    item: {
      '&[data-destructive]': {
        color: theme.palette.error.main,
        '& .MuiListItemIcon-root': {
          color: theme.palette.error.main,
        },
      },
    },
    end: {
      alignItems: 'center',
      color: theme.palette.text.secondary,
      display: 'flex',
      gap: theme.spacing(1),
      marginLeft: 'auto',
      paddingLeft: theme.spacing(3),
    },
    check: {
      display: 'inline-flex',
      '&:not([data-checked])': {
        visibility: 'hidden',
      },
    },
  }
})
