import { useMemo } from 'react'
import { PiLegoSmiley } from 'react-icons/pi'

import type { ColDef, GetQuickFilterTextParams } from 'ag-grid-community'
import { useAgGridStyles } from 'components/AgGrid'
import {
  buildActionsColDef,
  buildTagsColDef,
  buildTimelineColDef,
  buildTotalContext,
  ExternalLinksCellRenderer,
  type ExternalLinksCellRenderProps,
  ItemActionsCellRenderer,
  ItemIdCellRenderer,
  type ItemIdCellRenderProps,
  type MinifigActionsCellRendererProps,
  OverflowTypographyCellRenderer,
} from 'components/AgGrid/column'
import { useTagsVocabulary, useTimeline } from 'hooks'
import type { CollectionMinifig } from 'types/minifigs'
import { formatFrNumber } from 'utils/format'

import { OwnedCellRenderer } from '../components'
import useMinifigsMutations from './useMinifigsMutations'

const useMinifigsColDefs = () => {
  const { classes: agGridClasses } = useAgGridStyles()
  const { deleteMinifig, isPending } = useMinifigsMutations()
  const tagsVocabulary = useTagsVocabulary()
  const timeline = useTimeline()

  return useMemo(
    () =>
      [
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemIdCellRenderer,
          cellRendererParams: {
            icon: <PiLegoSmiley />,
            variant: 'minifig',
          } satisfies ItemIdCellRenderProps,
          context: buildTotalContext({ aggregation: 'count' }),
          field: 'id',
          headerName: 'Id',
          initialPinned: 'left',
          initialSort: 'asc',
          width: 120,
        },
        {
          cellRenderer: OverflowTypographyCellRenderer,
          field: 'name',
          flex: 1,
          headerName: 'Name',
          minWidth: 120,
        },
        {
          field: 'characterName',
          headerName: 'Character Name',
        },
        buildTimelineColDef<CollectionMinifig>(timeline),
        buildTagsColDef<CollectionMinifig>(tagsVocabulary),
        {
          cellClass: agGridClasses.flexAlignCenter,
          cellRenderer: OwnedCellRenderer,
          context: buildTotalContext<CollectionMinifig>({
            aggregation: 'sum',
            getValue: ({ owned }) => owned.total,
            formatValue: formatFrNumber,
          }),
          field: 'owned',
          headerName: 'Owned',
          resizable: false,
          valueFormatter: ({ value }) => value.total,
          width: 100,
          getQuickFilterText: ({
            data: { owned },
          }: GetQuickFilterTextParams<CollectionMinifig>) =>
            (owned.inSet ?? []).reduce(
              (quickFilterText, { setId }) => `${quickFilterText}, ${setId}`,
              owned.loose?.quantity > 0 ? 'loose' : ''
            ),
        },
        {
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ExternalLinksCellRenderer,
          cellRendererParams: {
            variant: 'minifig',
          } satisfies ExternalLinksCellRenderProps,
          colId: 'externalLinks',
          field: 'id',
          headerName: 'Links',
          resizable: false,
          sortable: false,
          width: 100,
        },
        buildActionsColDef<CollectionMinifig>({
          cellClass: [agGridClasses.flexAlignCenter, agGridClasses.gap1],
          cellRenderer: ItemActionsCellRenderer,
          cellRendererParams: {
            deleteItem: deleteMinifig,
            isPending,
            variant: 'minifig',
          } satisfies MinifigActionsCellRendererProps,
          field: 'id',
          width: 140,
        }),
      ] as const satisfies Array<ColDef<CollectionMinifig>>,
    [agGridClasses, deleteMinifig, isPending, tagsVocabulary, timeline]
  )
}

export default useMinifigsColDefs
