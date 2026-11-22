import {
  AllCommunityModule,
  colorSchemeDark,
  ModuleRegistry,
  themeMaterial,
} from 'ag-grid-community'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import type { ColumnLayoutId } from 'types/columnLayout'
import type { GetTotalRow, MapColIdsToTotals } from 'types/totalRow'

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
  getTotalRow?: GetTotalRow<TData>
  mapColIdsToTotals?: MapColIdsToTotals<TData>
}

const AgGridTable = <TData,>({
  className,
  columnLayoutId,
  getTotalRow,
  mapColIdsToTotals,
  ...props
}: AgGridTableProps<TData>) => {
  const { classes } = useAgGridTableStyles(undefined, {
    props: { classes: { container: className, layout: className } },
  })

  if (columnLayoutId)
    return (
      <ColumnLayoutGrid
        className={classes.layout}
        columnLayoutId={columnLayoutId}
        getTotalRow={getTotalRow}
        mapColIdsToTotals={mapColIdsToTotals}
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
