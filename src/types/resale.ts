import { z } from 'zod'

import { setValidationSchema } from './sets'

export const setConditions = ['sealed', 'opened', 'built'] as const
export const boxConditions = ['good', 'damaged', 'no box'] as const

export const resaleSetValidationSchema = z
  .object({
    id: setValidationSchema.shape.id,
    frenchName: z.string(),
    name: z.string().min(1, { message: 'Name is required' }),
    officialPrice: z
      .number()
      .min(0, { message: 'Official price can not be negative' })
      .nullable(),
    retired: z.boolean(),
    exitDate: z.string().nullable(),
    quantityBought: z
      .number({ message: 'Quantity bought is required' })
      .int()
      .min(1, { message: 'Quantity bought must be at least 1' }),
    unitBoughtPrice: z
      .number({ message: 'Unit bought price is required' })
      .positive({ message: 'Unit bought price must be greater than 0' }),
    unitSellingPrice: z
      .number()
      .min(0, { message: 'Unit selling price can not be negative' })
      .nullable(),
    quantitySold: z
      .number({ message: 'Quantity sold is required' })
      .int()
      .min(0, { message: 'Quantity sold can not be negative' }),
    setCondition: z.enum(setConditions),
    boxCondition: z.enum(boxConditions),
    location: z.string(),
  })
  .refine(
    ({ quantityBought, quantitySold }) => quantitySold <= quantityBought,
    {
      path: ['quantitySold'],
      message: 'You can not sell more than you bought',
    }
  )

export type ResaleSet = z.infer<typeof resaleSetValidationSchema>
export type ResaleSetFormInput = z.input<typeof resaleSetValidationSchema>
export type ResaleSetsList = ResaleSet[]
