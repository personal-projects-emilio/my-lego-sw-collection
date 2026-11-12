import { z } from 'zod'

export const minifigValidationSchema = z.object({
  appearances: z.array(z.string()),
  characterName: z.string().min(1, {
    message: 'Character name is required',
  }),
  id: z
    .string()
    .min(1, {
      message: 'Id is required',
    })
    .regex(/^sw[0-9]{4}[abcds]?$/, {
      message: 'This need to be a minifig id (/^sw[0-9]{4}[abcds]?$/)',
    }),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  possessed: z.boolean(),
  tags: z.array(z.string()),
  timelines: z.array(z.string()),
  owned: z.object({
    inSet: z
      .array(
        z.object({
          isInFrame: z.boolean().default(false),
          quantity: z.number().min(1).default(1),
          setId: z.string().min(1).or(z.number().min(1)),
        })
      )
      .default([]),
    loose: z.object({
      isInFrame: z.boolean().default(false),
      quantity: z.number().min(0).default(0),
    }),
    total: z.number().min(0).default(0),
  }),
})

export type Minifig = z.infer<typeof minifigValidationSchema>
export type MinifigFormInput = z.input<typeof minifigValidationSchema>

export type MinifigsList = Minifig[]
