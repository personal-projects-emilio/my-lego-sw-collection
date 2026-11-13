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
})

/** A minifig as stored in the DB */
export type Minifig = z.infer<typeof minifigValidationSchema>
export type MinifigFormInput = z.input<typeof minifigValidationSchema>

export type MinifigsList = Minifig[]

export type LooseMinifig = {
  isInFrame: boolean
  quantity: number
  unitBoughtPrice: number
  unitMarketValue: number
}

/** A loose minifig as stored in the DB. Only minifigs with a loose quantity above 0 have one */
export type StoredLooseMinifig = LooseMinifig & { id: Minifig['id'] }

export type LooseMinifigsList = StoredLooseMinifig[]

/** A minifig with the values buildCollection calculates from the sets and the loose minifigs */
export type CollectionMinifig = Minifig & {
  owned: {
    loose: LooseMinifig
    total: number
    inSet: {
      isInFrame: boolean
      possessed: boolean
      quantity: number
      setId: string | number
    }[]
  }
}

export type CollectionMinifigsList = CollectionMinifig[]
