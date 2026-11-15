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

const useAgGridTableStyles = makeStyles({ name: 'AgGridTable' })((theme) => ({
  container: {
    boxSizing: 'border-box',
    height: 'calc(100vh - 48px - 57px)',
    maxHeight: 'calc(100vh - 48px - 57px)',
    overflow: 'hidden',
    padding: theme.spacing(1),
    width: '100%',
  },
}))

const AgGridTable = forwardRef<
  AgGridReact,
  AgGridReactProps & { className?: string }
>(({ className, ...props }, ref) => {
  const { classes, cx } = useAgGridTableStyles()
  return (
    <div className={cx(classes.container, className)}>
      <AgGridReact
        ref={ref}
        theme={theme}
        tooltipHideDelay={60000}
        tooltipInteraction
        tooltipShowDelay={300}
        {...props}
      />
    </div>
  )
})

export default AgGridTable
