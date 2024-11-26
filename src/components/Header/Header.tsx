import type { FC } from 'react'

import {
  AppBar,
  type Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import appLogo from 'assets/favicon.ico'
import { makeStyles } from 'tss-react/mui'

import BurgerMenuNavigation from './BurgerMenuNavigation'
import TabsNavigation from './TabsNavigation'

const useStyles = makeStyles({ name: 'Header' })((theme) => ({
  toolbar: {
    gap: theme.spacing(1),
  },
  logo: {
    height: 24,
  },
  typography: {
    flexGrow: 1,
  },
}))

const Header: FC = () => {
  const hasLargeScreen = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.up('md')
  )
  const { classes } = useStyles()

  return (
    <AppBar position="sticky">
      <Toolbar variant="dense" className={classes.toolbar}>
        <img
          src={appLogo}
          className={classes.logo}
          alt="Application logo (cartoon of a pink elephant dancing)"
        />
        <Typography variant="h6" className={classes.typography}>
          {hasLargeScreen
            ? 'My Lego Star Wars Collection Manager'
            : 'My Lego SW'}
        </Typography>
        {hasLargeScreen ? <TabsNavigation /> : <BurgerMenuNavigation />}
      </Toolbar>
    </AppBar>
  )
}

export default Header
