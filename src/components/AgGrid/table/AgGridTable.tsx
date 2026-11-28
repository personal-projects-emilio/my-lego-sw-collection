import {
  AllCommunityModule,
  colorSchemeDark,
  ModuleRegistry,
  themeMaterial,
} from 'ag-grid-community'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import type { ColumnLayoutId } from 'types/columnLayout'
import type { ColumnFilterActions } from 'types/itemsFilter'
import type { GetTotalRow } from 'types/totalRow'

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
  columnFilter?: ColumnFilterActions
  columnLayoutId?: ColumnLayoutId
  getTotalRow?: GetTotalRow<TData>
  onReset?: () => void
}

const AgGridTable = <TData,>({
  className,
  columnFilter,
  columnLayoutId,
  getTotalRow,
  onReset,
  ...props
}: AgGridTableProps<TData>) => {
  const { classes } = useAgGridTableStyles(undefined, {
    props: { classes: { container: className, layout: className } },
  })

  if (columnLayoutId)
    return (
      <ColumnLayoutGrid
        className={classes.layout}
        columnFilter={columnFilter}
        columnLayoutId={columnLayoutId}
        getTotalRow={getTotalRow}
        onReset={onReset}
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
