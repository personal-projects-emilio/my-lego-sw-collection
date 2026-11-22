import {
  AllCommunityModule,
  colorSchemeDark,
  ModuleRegistry,
  themeMaterial,
} from 'ag-grid-community'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import type { ColumnLayoutId } from 'types/columnLayout'

import useAgGridTableStyles from './AgGridTable.styles'
import ColumnLayoutGrid from './ColumnLayoutGrid'
import { gridColors } from './gridColors'

ModuleRegistry.registerModules([AllCommunityModule])

const theme = themeMaterial.withPart(colorSchemeDark).withParams({
  borderColor: gridColors.border,
  cellHorizontalPadding: { calc: 'spacing * 2' },
  headerBackgroundColor: gridColors.chrome,
  wrapperBorder: false,
})

type AgGridTableProps<TData> = AgGridReactProps<TData> & {
  className?: string
  columnLayoutId?: ColumnLayoutId
}

const AgGridTable = <TData,>({
  className,
  columnLayoutId,
  ...props
}: AgGridTableProps<TData>) => {
  const { classes } = useAgGridTableStyles(undefined, {
    props: { classes: { container: className } },
  })

  if (columnLayoutId)
    return (
      <ColumnLayoutGrid
        className={classes.container}
        columnLayoutId={columnLayoutId}
        theme={theme}
        {...props}
      />
    )

  return (
    <div className={classes.container}>
      <AgGridReact theme={theme} {...props} />
    </div>
  )
}

export default AgGridTable
