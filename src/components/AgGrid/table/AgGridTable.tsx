import { forwardRef } from 'react'

import {
  AllCommunityModule,
  colorSchemeDark,
  ModuleRegistry,
  themeMaterial,
} from 'ag-grid-community'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import { makeStyles } from 'tss-react/mui'

ModuleRegistry.registerModules([AllCommunityModule])

const theme = themeMaterial
  .withPart(colorSchemeDark)
  .withParams({ cellHorizontalPadding: { calc: 'spacing * 2' } })

const useStyles = makeStyles({ name: 'AgGridTable' })((theme) => ({
  container: {
    boxSizing: 'border-box',
    height: 'calc(100vh - 48px - 57px)',
    maxHeight: 'calc(100vh - 48px - 57px)',
    overflow: 'hidden',
    padding: theme.spacing(1),
    width: '100%',
  },
}))

const AgGridTable = forwardRef<AgGridReact, AgGridReactProps>((props, ref) => {
  const { classes } = useStyles()
  return (
    <div className={classes.container}>
      <AgGridReact ref={ref} theme={theme} {...props} />
    </div>
  )
})

export default AgGridTable
