import { z } from 'zod'

export const setValidationSchema = z.object({
  appearances: z.array(z.string()),
  content: z.object({
    minifigs: z.array(
      z.object({
        id: z.string().min(1),
        characterName: z.string().min(1),
        quantity: z.number().min(1),
        isInFrame: z.boolean(),
      })
    ),
    box: z.nullable(z.boolean()),
    notice: z.nullable(z.boolean()),
    bags: z.nullable(z.boolean()),
    partsQuantity: z.nullable(z.number()),
  }),
  id: z
    .string()
    .min(1, {
      message: 'Id is required',
    })
    .or(
      z.number().min(1, {
        message: 'Id is required',
      })
    ),
  location: z.string(),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  note: z.string(),
  ownedQuantity: z.number(),
  possessed: z.boolean(),
  prices: z.object({
    bought: z.number(),
    storeValue: z.number(),
    marketValue: z.number(),
  }),
  releaseYear: z.number().min(1, {
    message: 'Release year is required',
  }),
  subtheme: z.string().min(1, {
    message: 'Subtheme is required',
  }),
  tags: z.array(z.string()),
  timelines: z.array(z.string()),
})

export type Set = z.infer<typeof setValidationSchema>
export type SetFormInput = z.input<typeof setValidationSchema>

export type SetsList = Set[]
