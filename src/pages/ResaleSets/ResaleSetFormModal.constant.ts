import type { ResaleSetFormInput } from 'types/resale'

export const defaultResaleSetFormValues: ResaleSetFormInput = {
  id: '',
  frenchName: '',
  name: '',
  officialPrice: null,
  retired: false,
  exitDate: null,
  quantityBought: 1,
  unitBoughtPrice: 0,
  unitSellingPrice: null,
  quantitySold: 0,
  setCondition: 'sealed',
  boxCondition: 'good',
  location: '',
}
