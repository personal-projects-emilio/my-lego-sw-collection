import { z } from 'zod'

export const minifigValidationSchema = z.object({
  appearances: z.array(z.string()).default([]),
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
  possessed: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  timelines: z.array(z.string()).default([]),
  owned: z.object({
    loose: z
      .object({
        quantity: z.number().default(0),
        isInFrame: z.boolean().default(false),
      })
      .default({ quantity: 0, isInFrame: false }),
    total: z.number().default(0),
    inSet: z
      .array(
        z.object({
          setId: z.string().min(1).or(z.number().min(1)),
          quantity: z.number().min(1),
          isInFrame: z.boolean().default(false),
        })
      )
      .default([]),
  }),
})

export type Minifig = z.infer<typeof minifigValidationSchema>

export type MinifigsList = Minifig[]
