import { FC } from 'react'

import {
  AppBar,
  type Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import appLogo from 'assets/favicon.ico'

const Header: FC = () => {
  const shouldShowLongTitle = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.up('md')
  )

  return (
    <AppBar position="sticky">
      <Toolbar variant="dense">
        <img src={appLogo} style={{ height: 24 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, marginLeft: 1 }}>
          {shouldShowLongTitle
            ? 'My Lego Star Wars Collection Manager'
            : 'My Lego SW'}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Header
