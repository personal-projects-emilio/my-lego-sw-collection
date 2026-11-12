import type { Set } from 'types/sets'

import type { SetFormModalProps } from './SetFormModal.types'

export const defaultSetFormValues = (setData: SetFormModalProps['setData']) =>
  ({
    id: '',
    appearances: [],
    location: '',
    name: '',
    note: '',
    ownedQuantity: 0,
    possessed: false,
    releaseYear: new Date().getFullYear(),
    subtheme: '',
    tags: [],
    timelines: [],
    imagePath: null,
    EAN: null,
    UPC: null,
    ...setData,
    content: {
      bags: null,
      box: null,
      minifigs: [],
      notice: null,
      partsQuantity: 0,
      ...(setData && 'content' in setData && setData.content),
    },
    dimensions: {
      box: {
        depth: 0,
        height: 0,
        width: 0,
        ...(setData && 'dimensions' in setData && setData.dimensions?.box),
      },
      model: {
        depth: 0,
        height: 0,
        width: 0,
        ...(setData && 'dimensions' in setData && setData.dimensions?.model),
      },
    },
    prices: {
      bought: 0,
      marketValue: 0,
      storeValue: 0,
      brickLinkSoldPriceNew: 0,
      brickLinkSoldPriceUsed: 0,
      ...(setData && 'prices' in setData && setData.prices),
    },
  }) satisfies Set
