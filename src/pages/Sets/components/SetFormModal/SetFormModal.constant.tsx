import type { Set } from 'types/sets'

import type { SetFormModalProps } from './SetFormModal.types'

const dimensions = (
  setData: SetFormModalProps['setData'],
  part: keyof Set['dimensions']
) => {
  const values =
    setData && 'dimensions' in setData ? setData.dimensions?.[part] : undefined
  return {
    depth: values?.depth || null,
    height: values?.height || null,
    width: values?.width || null,
  }
}

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
    bricksetImagePath: null,
    EAN: null,
    exitDate: null,
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
      box: dimensions(setData, 'box'),
      model: dimensions(setData, 'model'),
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
