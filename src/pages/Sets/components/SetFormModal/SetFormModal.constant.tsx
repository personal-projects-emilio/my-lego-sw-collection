import type { Set } from 'types/sets'

import type { SetFormModalProps } from './SetFormModal.types'

const getDimensions = ({
  setData,
  part,
}: {
  setData: SetFormModalProps['setData']
  part: keyof Set['dimensions']
}) => {
  const values =
    setData && 'dimensions' in setData ? setData.dimensions?.[part] : undefined
  return {
    depth: values?.depth || null,
    height: values?.height || null,
    width: values?.width || null,
  }
}

export const getDefaultSetFormValues = (
  setData: SetFormModalProps['setData']
) =>
  ({
    id: '',
    location: '',
    name: '',
    note: '',
    ownedQuantity: 0,
    retired: false,
    releaseYear: new Date().getFullYear(),
    subtheme: '',
    tags: [],
    timeline: [],
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
      box: getDimensions({ setData, part: 'box' }),
      model: getDimensions({ setData, part: 'model' }),
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

export const dimensionFields = (['model', 'box'] as const).flatMap((part) =>
  (['width', 'height', 'depth'] as const).map((axis) => ({
    name: `dimensions.${part}.${axis}` as const,
    label: `${part === 'model' ? 'Model' : 'Box'} ${axis}`,
  }))
)

export const priceFields = [
  { name: 'prices.bought', label: 'Bought' },
  { name: 'prices.storeValue', label: 'Store Value' },
  { name: 'prices.marketValue', label: 'Market Value' },
] as const

export const brickLinkPriceFields = [
  { name: 'prices.brickLinkSoldPriceNew', label: 'BrickLink Sold Price New' },
  { name: 'prices.brickLinkSoldPriceUsed', label: 'BrickLink Sold Price Used' },
] as const

export const contentFields = [
  { name: 'content.box', label: 'Box' },
  { name: 'content.notice', label: 'Notice' },
  { name: 'content.bags', label: 'Bags' },
] as const
