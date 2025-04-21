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
    releaseYear: new Date().getFullYear(),
    subtheme: '',
    tags: [],
    timelines: [],
    possessed: false,
    ...setData,
    content: {
      bags: null,
      box: null,
      minifigs: [],
      notice: null,
      partsQuantity: 0,
      ...(setData && 'content' in setData && setData.content),
    },
    prices: {
      bought: 0,
      marketValue: 0,
      storeValue: 0,
      ...(setData && 'prices' in setData && setData.prices),
    },
  }) satisfies Set
