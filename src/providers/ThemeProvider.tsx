import type { FC, PropsWithChildren } from 'react'

import { CssBaseline } from '@mui/material'
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles'

declare module '@mui/material/Switch' {
  interface SwitchPropsSizeOverrides {
    xsmall: true
  }
}

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
  },
  components: {
    MuiInputLabel: {
      defaultProps: {
        shrink: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        slotProps: {
          inputLabel: {
            shrink: true,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { size: 'xsmall' },
              style: {
                height: 20,
                padding: 6,
                width: 32,
                '& .MuiSwitch-switchBase': {
                  padding: 4,
                  '&.Mui-checked': { transform: 'translateX(12px)' },
                },
                '& .MuiSwitch-thumb': { height: 12, width: 12 },
                '& .MuiSwitch-track': { borderRadius: 4 },
              },
            },
          ],
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterDelay: 500,
        enterNextDelay: 500,
      },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.grey[800],
          boxSizing: 'unset',
        }),
        arrow: ({ theme }) => ({
          color: theme.palette.grey[800],
        }),
      },
    },
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
  },
})

const ThemeProvider: FC<PropsWithChildren> = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
)

export default ThemeProvider
