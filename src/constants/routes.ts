import { object, string } from 'zod'

export const addMinifigSearchSchema = object({
  duplicate: string().optional(),
})
